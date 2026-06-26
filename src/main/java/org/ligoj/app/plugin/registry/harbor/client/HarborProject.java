package org.ligoj.app.plugin.registry.harbor.client;

import org.ligoj.bootstrap.core.NamedBean;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

/**
 * Harbor project model. A Harbor project is the "registry" hosting the
 * Docker artifacts.
 */
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class HarborProject extends NamedBean<String> {

	/**
	 * SID
	 */
	private static final long serialVersionUID = 1L;

	/**
	 * Harbor project identifier.
	 */
	@JsonProperty("project_id")
	private int projectId;

	/**
	 * Amount of repositories hosted by this project.
	 */
	@JsonProperty("repo_count")
	private int repoCount;

}
