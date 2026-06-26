package org.ligoj.app.plugin.registry.harbor;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.HttpMethod;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.Strings;
import org.ligoj.app.api.SubscriptionStatusWithData;
import org.ligoj.app.plugin.registry.RegistryResource;
import org.ligoj.app.plugin.registry.RegistryServicePlugin;
import org.ligoj.app.plugin.registry.harbor.client.HarborProject;
import org.ligoj.app.resource.plugin.AbstractToolPluginResource;
import org.ligoj.bootstrap.core.NamedBean;
import org.ligoj.bootstrap.core.curl.AuthCurlProcessor;
import org.ligoj.bootstrap.core.curl.CurlProcessor;
import org.ligoj.bootstrap.core.curl.CurlRequest;
import org.ligoj.bootstrap.core.json.InMemoryPagination;
import org.ligoj.bootstrap.core.validation.ValidationJsonException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Harbor (CNCF) artifact registry resource. Harbor is a container
 * registry, so the artifact type is fixed to <code>docker</code>.
 */
@Path(HarborPluginResource.URL)
@Component
@Produces(MediaType.APPLICATION_JSON)
public class HarborPluginResource extends AbstractToolPluginResource implements RegistryServicePlugin {

	/**
	 * Plug-in URL.
	 */
	public static final String URL = RegistryResource.SERVICE_URL + "/harbor";

	/**
	 * Plug-in key.
	 */
	public static final String KEY = URL.replace('/', ':').substring(1);

	/**
	 * Harbor portal base URL (node validation).
	 */
	public static final String PARAMETER_URL = KEY + ":url";

	/**
	 * Login (node validation).
	 */
	public static final String PARAMETER_USER = KEY + ":user";

	/**
	 * Secret (node validation).
	 */
	public static final String PARAMETER_PASSWORD = KEY + ":password";

	/**
	 * Artifact type (subscription level). Fixed to <code>docker</code>.
	 */
	public static final String PARAMETER_TYPE = KEY + ":type";

	/**
	 * Target project/registry (subscription level).
	 */
	public static final String PARAMETER_REGISTRY = KEY + ":registry";

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private InMemoryPagination inMemoryPagination;

	@Override
	public String getKey() {
		return KEY;
	}

	/**
	 * Return the base URL without the trailing slash.
	 */
	private String getBaseUrl(final Map<String, String> parameters) {
		return Strings.CS.removeEnd(parameters.get(PARAMETER_URL), "/");
	}

	/**
	 * Create a new processor using a basic authentication header built from
	 * the node credentials.
	 */
	private CurlProcessor newProcessor(final Map<String, String> parameters) {
		return new AuthCurlProcessor(parameters.get(PARAMETER_USER),
				StringUtils.trimToEmpty(parameters.get(PARAMETER_PASSWORD)));
	}

	@Override
	public boolean checkStatus(final Map<String, String> parameters) {
		// Node validation: authenticated call to the current-user endpoint.
		final var request = new CurlRequest(HttpMethod.GET, getBaseUrl(parameters) + "/api/v2.0/users/current", null);
		try (var processor = newProcessor(parameters)) {
			return processor.process(request);
		}
	}

	/**
	 * Validate the subscription registry (the Harbor project) and return its
	 * matching projects. Throws when the project cannot be resolved.
	 */
	private List<HarborProject> validateRegistry(final Map<String, String> parameters) throws IOException {
		final var registry = parameters.get(PARAMETER_REGISTRY);
		final var request = new CurlRequest(HttpMethod.GET,
				getBaseUrl(parameters) + "/api/v2.0/projects?name=" + registry, null);
		request.setSaveResponse(true);
		final boolean found;
		try (var processor = newProcessor(parameters)) {
			found = processor.process(request);
		}
		if (!found) {
			throw new ValidationJsonException(PARAMETER_REGISTRY, "harbor-registry", registry);
		}
		final List<HarborProject> projects = objectMapper.readValue(
				StringUtils.defaultIfBlank(request.getResponse(), "[]"), new TypeReference<List<HarborProject>>() {
					// Nothing to extend
				});
		if (projects.isEmpty()) {
			throw new ValidationJsonException(PARAMETER_REGISTRY, "harbor-registry", registry);
		}
		return projects;
	}

	@Override
	public void link(final int subscription) throws IOException {
		validateRegistry(subscriptionResource.getParameters(subscription));
	}

	@Override
	public SubscriptionStatusWithData checkSubscriptionStatus(final Map<String, String> parameters) throws IOException {
		final var status = new SubscriptionStatusWithData();
		final var project = validateRegistry(parameters).getFirst();
		status.put("id", project.getProjectId());
		status.put("repositories", project.getRepoCount());
		return status;
	}

	/**
	 * Find the Harbor projects matching the given criteria.
	 *
	 * @param node     The node identifier holding the registry parameters.
	 * @param criteria The search criteria.
	 * @return The matching project names.
	 * @throws IOException When the Harbor response cannot be read.
	 */
	@GET
	@Path("{node}/{criteria}")
	public List<NamedBean<String>> findAllByName(@PathParam("node") final String node,
			@PathParam("criteria") final String criteria) throws IOException {
		final var parameters = pvResource.getNodeParameters(node);
		final var request = new CurlRequest(HttpMethod.GET,
				getBaseUrl(parameters) + "/api/v2.0/projects?q=name=~" + criteria, null);
		request.setSaveResponse(true);
		final boolean found;
		try (var processor = newProcessor(parameters)) {
			found = processor.process(request);
		}
		if (found) {
			final List<HarborProject> projects = objectMapper.readValue(
					StringUtils.defaultIfBlank(request.getResponse(), "[]"), new TypeReference<List<HarborProject>>() {
						// Nothing to extend
					});
			return inMemoryPagination
					.newPage(projects.stream().map(p -> new NamedBean<>(p.getName(), p.getName())).toList(),
							PageRequest.of(0, 10))
					.getContent();
		}
		return Collections.emptyList();
	}

}
