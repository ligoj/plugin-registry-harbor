# :anchor: Ligoj Harbor plugin ![Maven Central](https://img.shields.io/maven-central/v/org.ligoj.plugin/plugin-registry-harbor)

[![License](http://img.shields.io/:license-mit-blue.svg)](http://fabdouglas.mit-license.org/)

[Ligoj](https://github.com/ligoj/ligoj) Harbor plugin, extending the
[Registry plugin](https://github.com/ligoj/plugin-registry).

Tool-level plugin living at the node `service:registry:harbor`. It augments the
registry service parent with a subscription-row link to the Harbor projects
view and a registry chip. Harbor is a container registry, so the artifact
`type` is fixed to `docker`.

## Node parameters

| Parameter                          | Type     | Validation scope   | Secured | Purpose                                       |
| ---------------------------------- | -------- | ------------------ | ------- | --------------------------------------------- |
| `service:registry:harbor:url`      | `TEXT`   | node validation    | no      | Harbor portal base URL.                       |
| `service:registry:harbor:user`     | `TEXT`   | node validation    | no      | Credentials — login.                          |
| `service:registry:harbor:password` | `TEXT`   | node validation    | **yes** | Credentials — secret.                         |
| `service:registry:harbor:type`     | `SELECT` | subscription time  | no      | Artifact type — fixed to `docker`.            |
| `service:registry:harbor:registry` | `TEXT`   | subscription time  | no      | Harbor project hosting the artifacts.         |

`url` + credentials are required to validate the node; `type` + `registry` are
required only when subscribing a project. See
[`src/main/resources/csv/parameter.csv`](src/main/resources/csv/parameter.csv).

## Backend (Java) module

`HarborPluginResource` validates the node (authenticated call to
`/api/v2.0/users/current`) and the subscription registry
(`/api/v2.0/projects?name=<registry>`). Build & test with Maven:

```bash
mvn -Pjacoco verify     # JUnit (WireMock-backed) + JaCoCo (100% coverage)
```

## UI (Vue) module

```bash
cd ui
npm install
npm run build          # emits to ../src/main/resources/.../webjars/registry-harbor/vue/
npm run lint
npm test
npm run test:coverage  # enforces 100% coverage
```
