package org.ligoj.app.plugin.registry.harbor;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import jakarta.transaction.Transactional;

import org.apache.commons.io.IOUtils;
import org.apache.hc.core5.http.HttpStatus;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.ligoj.app.AbstractServerTest;
import org.ligoj.app.model.Node;
import org.ligoj.app.model.Parameter;
import org.ligoj.app.model.ParameterValue;
import org.ligoj.app.model.Project;
import org.ligoj.app.model.Subscription;
import org.ligoj.app.resource.subscription.SubscriptionResource;
import org.ligoj.bootstrap.MatcherUtil;
import org.ligoj.bootstrap.core.validation.ValidationJsonException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * Test class of {@link HarborPluginResource}
 */
@ExtendWith(SpringExtension.class)
@ContextConfiguration(locations = "classpath:/META-INF/spring/application-context-test.xml")
@Rollback
@Transactional
class HarborPluginResourceTest extends AbstractServerTest {

	@Autowired
	private HarborPluginResource resource;

	@Autowired
	private SubscriptionResource subscriptionResource;

	protected int subscription;

	@BeforeEach
	void prepareData() throws IOException {
		persistEntities("csv",
				new Class<?>[] { Node.class, Parameter.class, Project.class, Subscription.class, ParameterValue.class },
				StandardCharsets.UTF_8);
		this.subscription = getSubscription("Jupiter", HarborPluginResource.KEY);

		// Coverage only
		Assertions.assertEquals("service:registry:harbor", resource.getKey());
	}

	@Test
	void delete() throws Exception {
		resource.delete(subscription, false);
		em.flush();
		em.clear();
		// No custom data -> nothing to check
	}

	@Test
	void getVersion() throws Exception {
		Assertions.assertNull(resource.getVersion(subscription));
	}

	@Test
	void getLastVersion() throws Exception {
		Assertions.assertNull(resource.getLastVersion());
	}

	@Test
	void checkStatus() throws Exception {
		prepareMockUser();
		Assertions.assertTrue(resource.checkStatus(subscriptionResource.getParametersNoCheck(subscription)));
	}

	@Test
	void checkStatusFailed() {
		httpServer.stubFor(get(urlPathEqualTo("/api/v2.0/users/current"))
				.willReturn(aResponse().withStatus(HttpStatus.SC_UNAUTHORIZED)));
		httpServer.start();
		Assertions.assertFalse(resource.checkStatus(subscriptionResource.getParametersNoCheck(subscription)));
	}

	@Test
	void link() throws Exception {
		prepareMockProjects();
		resource.link(this.subscription);
		// Nothing to validate but the absence of exception
	}

	@Test
	void linkNotFound() {
		httpServer.stubFor(
				get(urlPathEqualTo("/api/v2.0/projects")).willReturn(aResponse().withStatus(HttpStatus.SC_NOT_FOUND)));
		httpServer.start();
		MatcherUtil.assertThrows(
				Assertions.assertThrows(ValidationJsonException.class, () -> resource.link(this.subscription)),
				"service:registry:harbor:registry", "harbor-registry");
	}

	@Test
	void linkEmpty() {
		httpServer.stubFor(get(urlPathEqualTo("/api/v2.0/projects"))
				.willReturn(aResponse().withStatus(HttpStatus.SC_OK).withBody("[]")));
		httpServer.start();
		MatcherUtil.assertThrows(
				Assertions.assertThrows(ValidationJsonException.class, () -> resource.link(this.subscription)),
				"service:registry:harbor:registry", "harbor-registry");
	}

	@Test
	void checkSubscriptionStatus() throws IOException {
		prepareMockProjects();
		final var status = resource.checkSubscriptionStatus(subscriptionResource.getParametersNoCheck(subscription));
		Assertions.assertTrue(status.getStatus().isUp());
		Assertions.assertEquals(7, status.getData().get("id"));
		Assertions.assertEquals(12, status.getData().get("repositories"));
	}

	@Test
	void findAllByName() throws IOException {
		prepareMockProjects();
		final var projects = resource.findAllByName("service:registry:harbor:dig", "lig");
		Assertions.assertEquals(2, projects.size());
		Assertions.assertEquals("ligoj", projects.getFirst().getId());
		Assertions.assertEquals("ligoj", projects.getFirst().getName());
	}

	@Test
	void findAllByNameNoListing() throws IOException {
		httpServer.start();
		final var projects = resource.findAllByName("service:registry:harbor:dig", "none");
		Assertions.assertEquals(0, projects.size());
	}

	private void prepareMockUser() {
		httpServer.stubFor(get(urlPathEqualTo("/api/v2.0/users/current"))
				.willReturn(aResponse().withStatus(HttpStatus.SC_OK).withBody("{\"username\":\"junit\"}")));
		httpServer.start();
	}

	private void prepareMockProjects() throws IOException {
		httpServer.stubFor(get(urlPathEqualTo("/api/v2.0/projects")).willReturn(aResponse()
				.withStatus(HttpStatus.SC_OK)
				.withBody(IOUtils.toString(
						new ClassPathResource("mock-server/registry/harbor/projects.json").getInputStream(),
						StandardCharsets.UTF_8))));
		httpServer.start();
	}

}
