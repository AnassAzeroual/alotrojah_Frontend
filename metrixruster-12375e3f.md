# MetrixRuster report — test

- Workspace: `d81ad594-dc9e-4df0-be51-461567c69eb1`
- Snapshot: `12375e3f-036d-4eb8-8f15-5b16e66f78f3`
- Status: completed
- Engine: mr-rules/m3-1/v1
- Created: 1793501296919
- Findings: 2614

## Source debt

| Metric | Value |
|---|---|
| Profile | v1 |
| Status | available |
| Debt points | 24 |
| Density / 1k LOC | 0.8 |
| Analyzed LOC | 30872 |
| Scored findings | 8 |
| Excluded by confidence | 1133 |

## Coverage

| Check | Selected | Status | Findings | Reason |
|---|---|---|---|---|
| angular.dead-routes | yes | completed | 56 |  |
| angular.unused-declarations | yes | completed | 0 |  |
| angular.unused-inputs-outputs | yes | completed | 0 |  |
| angular.unused-standalone-imports | yes | completed | 0 |  |
| angular.unused-template-refs | yes | completed | 6 |  |
| angular.zoneless-readiness | yes | completed | 0 |  |
| assets.missing | yes | completed | 1 |  |
| assets.unused | yes | completed | 0 |  |
| clone.copy-paste | yes | completed | 1 |  |
| clone.duplicate-content | yes | completed | 0 |  |
| clone.function | yes | completed | 79 |  |
| clone.type2 | yes | completed | 26 |  |
| config.unused-env-keys | yes | completed | 0 |  |
| dead.orphan-files | yes | completed | 0 |  |
| dead.unused-exports | yes | completed | 10 |  |
| dead.unused-imports | yes | completed | 0 |  |
| dead.unused-locals | yes | completed | 1 |  |
| dead.unused-params | yes | completed | 0 |  |
| dead.unused-private-members | yes | completed | 6 |  |
| dependencies.health | yes | completed | 0 | check is not implemented in this build |
| dependency.missing-license | yes | completed | 0 |  |
| dependency.missing-lockfile | yes | completed | 0 |  |
| git.churn-hotspot | yes | completed | 20 |  |
| html.syntax | yes | completed | 0 |  |
| i18n.missing-keys | yes | completed | 0 |  |
| i18n.unused-keys | yes | completed | 814 |  |
| security.hardcoded-secret | yes | completed | 9 |  |
| structure.complexity | yes | completed | 20 |  |
| structure.explicit-any | yes | completed | 4 |  |
| structure.import-cycles | yes | completed | 0 |  |
| styles.duplicate-selectors | yes | completed | 829 |  |
| styles.hardcoded-colors | yes | completed | 36 |  |
| styles.important | yes | completed | 0 |  |
| styles.unused-selectors | yes | completed | 137 |  |
| subscriptions.nested | yes | completed | 0 |  |
| subscriptions.notifier | yes | completed | 0 |  |
| subscriptions.operator-order | yes | completed | 0 |  |
| subscriptions.subject | yes | completed | 1 |  |
| subscriptions.teardown | yes | completed | 58 |  |
| test.focused-suite | yes | completed | 0 |  |
| tool.depcheck | yes | completed | 7 |  |
| tool.eslint | yes | completed | 0 |  |
| tool.gitleaks | yes | completed | 0 |  |
| tool.jscpd | yes | completed | 408 |  |
| tool.knip | yes | completed | 85 |  |
| tool.semgrep | yes | completed | 0 |  |
| tool.stylelint | yes | completed | 0 |  |
| typescript.diagnostics | yes | completed | 0 |  |
| dart.empty-catch | no | not_applicable | 0 | no applicable detected unit |
| dart.print | no | not_applicable | 0 | no applicable detected unit |
| dart.todo | no | not_applicable | 0 | no applicable detected unit |
| php.blade-syntax | no | not_applicable | 0 | no applicable detected unit |
| php.syntax | no | not_applicable | 0 | no applicable detected unit |
| rust.panic | no | not_applicable | 0 | no applicable detected unit |
| rust.unsafe | no | not_applicable | 0 | no applicable detected unit |
| rust.unwrap | no | not_applicable | 0 | no applicable detected unit |
| tool.audit | no | not_applicable | 0 | no applicable detected unit |
| tool.clippy | no | not_applicable | 0 | no applicable detected unit |
| tool.composer-unused | no | not_applicable | 0 | no applicable detected unit |
| tool.dart-analyze | no | not_applicable | 0 | no applicable detected unit |
| tool.deny | no | not_applicable | 0 | no applicable detected unit |
| tool.dotnet-format | no | not_applicable | 0 | no applicable detected unit |
| tool.flutter-analyze | no | not_applicable | 0 | no applicable detected unit |
| tool.govulncheck | no | not_applicable | 0 | no applicable detected unit |
| tool.machete | no | not_applicable | 0 | no applicable detected unit |
| tool.mypy | no | not_applicable | 0 | no applicable detected unit |
| tool.phpcs | no | not_applicable | 0 | no applicable detected unit |
| tool.phpstan | no | not_applicable | 0 | no applicable detected unit |
| tool.pip-audit | no | not_applicable | 0 | no applicable detected unit |
| tool.pmd | no | not_applicable | 0 | no applicable detected unit |
| tool.pyright | no | not_applicable | 0 | no applicable detected unit |
| tool.rubocop | no | not_applicable | 0 | no applicable detected unit |
| tool.ruff | no | not_applicable | 0 | no applicable detected unit |
| tool.sorbet | no | not_applicable | 0 | no applicable detected unit |
| tool.staticcheck | no | not_applicable | 0 | no applicable detected unit |
| tool.udeps | no | not_applicable | 0 | no applicable detected unit |
| tool.vulture | no | not_applicable | 0 | no applicable detected unit |
| vue.sfc-syntax | no | not_applicable | 0 | no applicable detected unit |
| vue.style-syntax | no | not_applicable | 0 | no applicable detected unit |
| vue.template-syntax | no | not_applicable | 0 | no applicable detected unit |
| vue.undeclared-emit | no | not_applicable | 0 | no applicable detected unit |
| vue.unused-component-import | no | not_applicable | 0 | no applicable detected unit |
| vue.unused-prop | no | not_applicable | 0 | no applicable detected unit |
| vue.unused-style-selector | no | not_applicable | 0 | no applicable detected unit |

## Dependencies

| Package | Version | Scope | License |
|---|---|---|---|
| @ampproject/remapping | 2.3.0 | prod | Apache-2.0 |
| @angular-devkit/architect | 0.2202.0 | prod | MIT |
| @angular-devkit/core | 22.2.0 | prod | MIT |
| @angular-devkit/schematics | 22.2.0 | prod | MIT |
| @angular-eslint/builder | 22.6.0 | prod | MIT |
| @angular-eslint/bundled-angular-compiler | 22.6.0 | prod | MIT |
| @angular-eslint/eslint-plugin | 22.6.0 | dev | MIT |
| @angular-eslint/eslint-plugin-template | 22.6.0 | prod | MIT |
| @angular-eslint/schematics | 22.6.0 | prod | MIT |
| @angular-eslint/template-parser | 22.6.0 | dev | MIT |
| @angular-eslint/utils | 22.6.0 | dev | MIT |
| @angular/build | 22.2.0 | dev | MIT |
| @angular/cdk | 22.2.3 | prod | MIT |
| @angular/cli | 22.2.0 | dev | MIT |
| @angular/common | 22.2.0 | prod | MIT |
| @angular/compiler | 22.2.0 | prod | MIT |
| @angular/compiler-cli | 22.2.0 | dev | MIT |
| @angular/core | 22.2.0 | prod | MIT |
| @angular/forms | 22.2.0 | prod | MIT |
| @angular/platform-browser | 22.2.0 | prod | MIT |
| @angular/router | 22.2.0 | prod | MIT |
| @asamuzakjp/css-color | 7.1.2 | prod | MIT |
| @asamuzakjp/dom-selector | 9.2.2 | prod | MIT |
| @babel/code-frame | 8.0.6 | prod | MIT |
| @babel/compat-data | 8.0.5 | prod | MIT |
| @babel/core | 8.0.1 | prod | MIT |
| @babel/generator | 8.0.6 | prod | MIT |
| @babel/helper-compilation-targets | 8.0.6 | prod | MIT |
| @babel/helper-globals | 8.0.6 | prod | MIT |
| @babel/helper-string-parser | 8.0.6 | prod | MIT |
| @babel/helper-validator-identifier | 8.0.6 | prod | MIT |
| @babel/helper-validator-option | 8.0.0 | prod | MIT |
| @babel/helpers | 8.0.5 | prod | MIT |
| @babel/parser | 8.0.6 | prod | MIT |
| @babel/template | 8.0.0 | prod | MIT |
| @babel/traverse | 8.0.6 | prod | MIT |
| @babel/types | 8.0.6 | prod | MIT |
| @bcoe/v8-coverage | 1.0.2 | prod | MIT |
| @bramus/specificity | 2.4.2 | prod | MIT |
| @bufbuild/protobuf | 2.15.0 | prod | (Apache-2.0 AND BSD-3-Clause) |
| @csstools/color-helpers | 6.1.2 | prod | MIT-0 |
| @csstools/css-calc | 3.4.1 | prod | MIT |
| @csstools/css-color-parser | 4.2.4 | prod | MIT |
| @csstools/css-parser-algorithms | 4.0.1 | prod | MIT |
| @csstools/css-syntax-patches-for-csstree | 1.1.14 | prod | MIT-0 |
| @csstools/css-tokenizer | 4.0.2 | prod | MIT |
| @esbuild/aix-ppc64 | 0.28.2 | prod | MIT |
| @esbuild/android-arm | 0.28.2 | prod | MIT |
| @esbuild/android-arm64 | 0.28.2 | prod | MIT |
| @esbuild/android-x64 | 0.28.2 | prod | MIT |
| @esbuild/darwin-arm64 | 0.28.2 | prod | MIT |
| @esbuild/darwin-x64 | 0.28.2 | prod | MIT |
| @esbuild/freebsd-arm64 | 0.28.2 | prod | MIT |
| @esbuild/freebsd-x64 | 0.28.2 | prod | MIT |
| @esbuild/linux-arm | 0.28.2 | prod | MIT |
| @esbuild/linux-arm64 | 0.28.2 | prod | MIT |
| @esbuild/linux-ia32 | 0.28.2 | prod | MIT |
| @esbuild/linux-loong64 | 0.28.2 | prod | MIT |
| @esbuild/linux-mips64el | 0.28.2 | prod | MIT |
| @esbuild/linux-ppc64 | 0.28.2 | prod | MIT |
| @esbuild/linux-riscv64 | 0.28.2 | prod | MIT |
| @esbuild/linux-s390x | 0.28.2 | prod | MIT |
| @esbuild/linux-x64 | 0.28.2 | prod | MIT |
| @esbuild/netbsd-arm64 | 0.28.2 | prod | MIT |
| @esbuild/netbsd-x64 | 0.28.2 | prod | MIT |
| @esbuild/openbsd-arm64 | 0.28.2 | prod | MIT |
| @esbuild/openbsd-x64 | 0.28.2 | prod | MIT |
| @esbuild/openharmony-arm64 | 0.28.2 | prod | MIT |
| @esbuild/sunos-x64 | 0.28.2 | prod | MIT |
| @esbuild/win32-arm64 | 0.28.2 | prod | MIT |
| @esbuild/win32-ia32 | 0.28.2 | prod | MIT |
| @esbuild/win32-x64 | 0.28.2 | prod | MIT |
| @eslint-community/eslint-utils | 4.10.1 | prod | MIT |
| @eslint-community/regexpp | 4.12.2 | prod | MIT |
| @eslint/config-array | 0.21.2 | prod | Apache-2.0 |
| @eslint/config-helpers | 0.4.2 | prod | Apache-2.0 |
| @eslint/core | 0.17.0 | prod | Apache-2.0 |
| @eslint/eslintrc | 3.3.7 | prod | MIT |
| @eslint/js | 9.39.5 | prod | MIT |
| @eslint/object-schema | 2.1.7 | prod | Apache-2.0 |
| @eslint/plugin-kit | 0.4.1 | prod | Apache-2.0 |
| @exodus/bytes | 1.16.0 | prod | MIT |
| @formatjs/ecma402-abstract | 2.3.6 | prod | MIT |
| @formatjs/fast-memoize | 2.2.7 | prod | MIT |
| @formatjs/icu-messageformat-parser | 2.11.4 | prod | MIT |
| @formatjs/icu-skeleton-parser | 1.8.16 | prod | MIT |
| @formatjs/intl-localematcher | 0.6.2 | prod | MIT |
| @harperfast/extended-iterable | 1.0.3 | prod | Apache-2.0 |
| @hey-api/codegen-core | 0.8.2 | prod | MIT |
| @hey-api/json-schema-ref-parser | 1.4.2 | prod | MIT |
| @hey-api/openapi-ts | 0.97.3 | dev | MIT |
| @hey-api/shared | 0.4.5 | prod | MIT |
| @hey-api/spec-types | 0.2.0 | prod | MIT |
| @hey-api/types | 0.1.4 | prod | MIT |
| @humanfs/core | 0.19.2 | prod | Apache-2.0 |
| @humanfs/node | 0.16.8 | prod | Apache-2.0 |
| @humanfs/types | 0.15.0 | prod | Apache-2.0 |
| @humanwhocodes/module-importer | 1.0.1 | prod | Apache-2.0 |
| @humanwhocodes/retry | 0.4.3 | prod | Apache-2.0 |
| @inquirer/ansi | 2.0.8 | prod | MIT |
| @inquirer/checkbox | 5.2.5 | prod | MIT |
| @inquirer/confirm | 6.3.2 | prod | MIT |
| @inquirer/core | 12.0.3 | prod | MIT |
| @inquirer/editor | 5.3.3 | prod | MIT |
| @inquirer/expand | 5.1.5 | prod | MIT |
| @inquirer/external-editor | 3.0.5 | prod | MIT |
| @inquirer/figures | 2.0.9 | prod | MIT |
| @inquirer/input | 5.1.6 | prod | MIT |
| @inquirer/number | 4.2.3 | prod | MIT |
| @inquirer/password | 5.2.2 | prod | MIT |
| @inquirer/prompts | 8.7.2 | prod | MIT |
| @inquirer/rawlist | 5.3.5 | prod | MIT |
| @inquirer/search | 4.3.3 | prod | MIT |
| @inquirer/select | 5.2.5 | prod | MIT |
| @inquirer/type | 4.1.1 | prod | MIT |
| @jridgewell/gen-mapping | 0.4.0-beta.0 | prod | MIT |
| @jridgewell/resolve-uri | 3.1.2 | prod | MIT |
| @jridgewell/sourcemap-codec | 1.6.0 | prod | MIT |
| @jridgewell/trace-mapping | 0.3.31 | prod | MIT |
| @jsdevtools/ono | 7.1.3 | prod | MIT |
| @kurkle/color | 0.3.4 | prod | MIT |
| @listr2/prompt-adapter-inquirer | 4.2.7 | prod | MIT |
| @lmdb/lmdb-darwin-arm64 | 3.5.6 | prod | MIT |
| @lmdb/lmdb-darwin-x64 | 3.5.6 | prod | MIT |
| @lmdb/lmdb-linux-arm | 3.5.6 | prod | MIT |
| @lmdb/lmdb-linux-arm64 | 3.5.6 | prod | MIT |
| @lmdb/lmdb-linux-x64 | 3.5.6 | prod | MIT |
| @lmdb/lmdb-win32-arm64 | 3.5.6 | prod | MIT |
| @lmdb/lmdb-win32-x64 | 3.5.6 | prod | MIT |
| @lukeed/ms | 2.0.2 | prod | MIT |
| @mattlewis92/dom-autoscroller | 2.4.2 | prod | MIT |
| @modelcontextprotocol/core | 2.0.0 | prod | MIT |
| @modelcontextprotocol/server | 2.0.0 | prod | MIT |
| @msgpackr-extract/msgpackr-extract-darwin-arm64 | 3.0.4 | prod | MIT |
| @msgpackr-extract/msgpackr-extract-darwin-x64 | 3.0.4 | prod | MIT |
| @msgpackr-extract/msgpackr-extract-linux-arm | 3.0.4 | prod | MIT |
| @msgpackr-extract/msgpackr-extract-linux-arm64 | 3.0.4 | prod | MIT |
| @msgpackr-extract/msgpackr-extract-linux-x64 | 3.0.4 | prod | MIT |
| @msgpackr-extract/msgpackr-extract-win32-x64 | 3.0.4 | prod | MIT |
| @napi-rs/nice | 1.1.1 | prod | MIT |
| @napi-rs/nice-android-arm-eabi | 1.1.1 | prod | MIT |
| @napi-rs/nice-android-arm64 | 1.1.1 | prod | MIT |
| @napi-rs/nice-darwin-arm64 | 1.1.1 | prod | MIT |
| @napi-rs/nice-darwin-x64 | 1.1.1 | prod | MIT |
| @napi-rs/nice-freebsd-x64 | 1.1.1 | prod | MIT |
| @napi-rs/nice-linux-arm-gnueabihf | 1.1.1 | prod | MIT |
| @napi-rs/nice-linux-arm64-gnu | 1.1.1 | prod | MIT |
| @napi-rs/nice-linux-arm64-musl | 1.1.1 | prod | MIT |
| @napi-rs/nice-linux-ppc64-gnu | 1.1.1 | prod | MIT |
| @napi-rs/nice-linux-riscv64-gnu | 1.1.1 | prod | MIT |
| @napi-rs/nice-linux-s390x-gnu | 1.1.1 | prod | MIT |
| @napi-rs/nice-linux-x64-gnu | 1.1.1 | prod | MIT |
| @napi-rs/nice-linux-x64-musl | 1.1.1 | prod | MIT |
| @napi-rs/nice-openharmony-arm64 | 1.1.1 | prod | MIT |
| @napi-rs/nice-win32-arm64-msvc | 1.1.1 | prod | MIT |
| @napi-rs/nice-win32-ia32-msvc | 1.1.1 | prod | MIT |
| @napi-rs/nice-win32-x64-msvc | 1.1.1 | prod | MIT |
| @ngx-translate/core | 18.0.0 | prod | MIT |
| @ngx-translate/http-loader | 18.0.0 | prod | MIT |
| @noble/ciphers | 2.4.0 | prod | MIT |
| @noble/hashes | 2.4.0 | prod | MIT |
| @opentelemetry/api | 1.9.1 | prod | Apache-2.0 |
| @opentelemetry/api-logs | 0.220.0 | prod | Apache-2.0 |
| @opentelemetry/core | 2.11.0 | prod | Apache-2.0 |
| @opentelemetry/instrumentation | 0.220.0 | prod | Apache-2.0 |
| @opentelemetry/resources | 2.11.0 | prod | Apache-2.0 |
| @opentelemetry/sdk-trace | 2.11.0 | prod | Apache-2.0 |
| @opentelemetry/sdk-trace-base | 2.11.0 | prod | Apache-2.0 |
| @opentelemetry/semantic-conventions | 1.43.0 | prod | Apache-2.0 |
| @oxc-parser/binding-android-arm-eabi | 0.150.0 | prod | MIT |
| @oxc-parser/binding-android-arm64 | 0.150.0 | prod | MIT |
| @oxc-parser/binding-darwin-arm64 | 0.150.0 | prod | MIT |
| @oxc-parser/binding-darwin-x64 | 0.150.0 | prod | MIT |
| @oxc-parser/binding-freebsd-x64 | 0.150.0 | prod | MIT |
| @oxc-parser/binding-linux-arm-gnueabihf | 0.150.0 | prod | MIT |
| @oxc-parser/binding-linux-arm-musleabihf | 0.150.0 | prod | MIT |
| @oxc-parser/binding-linux-arm64-gnu | 0.150.0 | prod | MIT |
| @oxc-parser/binding-linux-arm64-musl | 0.150.0 | prod | MIT |
| @oxc-parser/binding-linux-ppc64-gnu | 0.150.0 | prod | MIT |
| @oxc-parser/binding-linux-riscv64-gnu | 0.150.0 | prod | MIT |
| @oxc-parser/binding-linux-riscv64-musl | 0.150.0 | prod | MIT |
| @oxc-parser/binding-linux-s390x-gnu | 0.150.0 | prod | MIT |
| @oxc-parser/binding-linux-x64-gnu | 0.150.0 | prod | MIT |
| @oxc-parser/binding-linux-x64-musl | 0.150.0 | prod | MIT |
| @oxc-parser/binding-openharmony-arm64 | 0.150.0 | prod | MIT |
| @oxc-parser/binding-win32-arm64-msvc | 0.150.0 | prod | MIT |
| @oxc-parser/binding-win32-ia32-msvc | 0.150.0 | prod | MIT |
| @oxc-parser/binding-win32-x64-msvc | 0.150.0 | prod | MIT |
| @oxc-project/types | 0.150.0 | prod | MIT |
| @parcel/watcher | 2.6.0 | prod | MIT |
| @parcel/watcher-android-arm64 | 2.6.0 | prod | MIT |
| @parcel/watcher-darwin-arm64 | 2.6.0 | prod | MIT |
| @parcel/watcher-darwin-x64 | 2.6.0 | prod | MIT |
| @parcel/watcher-freebsd-x64 | 2.6.0 | prod | MIT |
| @parcel/watcher-linux-arm-glibc | 2.6.0 | prod | MIT |
| @parcel/watcher-linux-arm-musl | 2.6.0 | prod | MIT |
| @parcel/watcher-linux-arm64-glibc | 2.6.0 | prod | MIT |
| @parcel/watcher-linux-arm64-musl | 2.6.0 | prod | MIT |
| @parcel/watcher-linux-x64-glibc | 2.6.0 | prod | MIT |
| @parcel/watcher-linux-x64-musl | 2.6.0 | prod | MIT |
| @parcel/watcher-win32-arm64 | 2.6.0 | prod | MIT |
| @parcel/watcher-win32-x64 | 2.6.0 | prod | MIT |
| @paulirish/trace_engine | 0.0.65 | prod | BSD-3-Clause |
| @playwright/test | 1.63.0 | dev | Apache-2.0 |
| @puppeteer/browsers | 3.2.3 | prod | Apache-2.0 |
| @rolldown/binding-android-arm-eabi | 1.2.8 | prod | MIT |
| @rolldown/binding-android-arm64 | 1.2.8 | prod | MIT |
| @rolldown/binding-darwin-arm64 | 1.2.8 | prod | MIT |
| @rolldown/binding-darwin-x64 | 1.2.8 | prod | MIT |
| @rolldown/binding-freebsd-x64 | 1.2.8 | prod | MIT |
| @rolldown/binding-linux-arm-gnueabihf | 1.2.8 | prod | MIT |
| @rolldown/binding-linux-arm64-gnu | 1.2.8 | prod | MIT |
| @rolldown/binding-linux-arm64-musl | 1.2.8 | prod | MIT |
| @rolldown/binding-linux-ppc64-gnu | 1.2.8 | prod | MIT |
| @rolldown/binding-linux-s390x-gnu | 1.2.8 | prod | MIT |
| @rolldown/binding-linux-x64-gnu | 1.2.8 | prod | MIT |
| @rolldown/binding-linux-x64-musl | 1.2.8 | prod | MIT |
| @rolldown/binding-openharmony-arm64 | 1.2.8 | prod | MIT |
| @rolldown/binding-win32-arm64-msvc | 1.2.8 | prod | MIT |
| @rolldown/binding-win32-x64-msvc | 1.2.8 | prod | MIT |
| @rolldown/pluginutils | 1.0.1 | prod | MIT |
| @scarf/scarf | 1.4.0 | prod | Apache-2.0 |
| @schematics/angular | 22.2.0 | prod | MIT |
| @sentry/conventions | 0.16.0 | prod | MIT |
| @sentry/core | 10.75.3 | prod | MIT |
| @sentry/node | 10.75.3 | prod | MIT |
| @sentry/node-core | 10.75.3 | prod | MIT |
| @sentry/opentelemetry | 10.75.3 | prod | MIT |
| @sentry/server-utils | 10.75.3 | prod | MIT |
| @standard-schema/spec | 1.1.0 | prod | MIT |
| @types/chai | 5.2.3 | prod | MIT |
| @types/crypto-js | 4.2.2 | dev | MIT |
| @types/deep-eql | 4.0.2 | prod | MIT |
| @types/esrecurse | 4.3.1 | prod | MIT |
| @types/estree | 1.0.9 | prod | MIT |
| @types/gensync | 1.0.5 | prod | MIT |
| @types/jsesc | 2.5.1 | prod | MIT |
| @types/json-schema | 7.0.15 | prod | MIT |
| @types/node | 26.6.3 | dev | MIT |
| @typescript-eslint/eslint-plugin | 8.71.1 | prod | MIT |
| @typescript-eslint/parser | 8.71.1 | prod | MIT |
| @typescript-eslint/project-service | 8.71.1 | prod | MIT |
| @typescript-eslint/scope-manager | 8.71.1 | prod | MIT |
| @typescript-eslint/tsconfig-utils | 8.71.1 | prod | MIT |
| @typescript-eslint/type-utils | 8.71.1 | prod | MIT |
| @typescript-eslint/types | 8.71.1 | prod | MIT |
| @typescript-eslint/typescript-estree | 8.71.1 | prod | MIT |
| @typescript-eslint/utils | 8.71.1 | prod | MIT |
| @typescript-eslint/visitor-keys | 8.71.1 | prod | MIT |
| @vitejs/plugin-basic-ssl | 2.3.0 | prod | MIT |
| @vitest/coverage-v8 | 5.0.2 | dev | MIT |
| @vitest/istanbul-lib-coverage | 1.0.2 | prod | MIT |
| @vitest/istanbul-lib-report | 1.0.2 | prod | MIT |
| @vitest/mocker | 5.0.2 | prod | MIT |
| @vitest/spy | 5.0.2 | prod | MIT |
| acorn | 8.19.0 | prod | MIT |
| acorn-jsx | 5.3.2 | prod | MIT |
| agent-base | 9.0.0 | prod | MIT |
| ajv | 6.15.0 | prod | MIT |
| ajv-formats | 3.0.1 | prod | MIT |
| angular-calendar | 0.32.2 | prod | MIT |
| angular-draggable-droppable | 9.0.1 | prod | MIT |
| angular-eslint | 22.6.0 | dev | MIT |
| angular-resizable-element | 8.0.3 | prod | MIT |
| ansi-colors | 4.1.3 | prod | MIT |
| ansi-escapes | 7.3.0 | prod | MIT |
| ansi-regex | 6.4.0 | prod | MIT |
| ansi-styles | 6.2.3 | prod | MIT |
| argparse | 2.0.1 | prod | Python-2.0 |
| aria-query | 5.3.2 | prod | Apache-2.0 |
| assertion-error | 2.0.1 | prod | MIT |
| ast-v8-to-istanbul | 1.0.7 | prod | MIT |
| atomically | 2.1.1 | prod | MIT |
| axe-core | 4.13.0 | prod | MPL-2.0 |
| axobject-query | 4.1.0 | prod | Apache-2.0 |
| balanced-match | 1.0.2 | prod | MIT |
| baseline-browser-mapping | 2.11.26 | prod | Apache-2.0 |
| beasties | 0.5.4 | prod | Apache-2.0 |
| bidi-js | 1.1.0 | prod | MIT |
| boolbase | 2.0.0 | prod | ISC |
| brace-expansion | 1.1.21 | prod | MIT |
| browserslist | 4.29.2 | prod | MIT |
| buffer-from | 1.1.2 | prod | MIT |
| bundle-name | 4.1.1 | prod | MIT |
| c12 | 3.3.4 | prod | MIT |
| calendar-utils | 0.12.5 | prod | MIT |
| callsites | 3.1.0 | prod | MIT |
| caniuse-lite | 1.0.30001813 | prod | CC-BY-4.0 |
| chai | 6.2.2 | prod | MIT |
| chalk | 5.6.2 | prod | MIT |
| chardet | 2.2.0 | prod | MIT |
| chart.js | 4.5.1 | prod | MIT |
| chokidar | 5.0.0 | prod | MIT |
| chrome-launcher | 1.2.1 | prod | Apache-2.0 |
| chromium-bidi | 17.0.2 | prod | Apache-2.0 |
| cjs-module-lexer | 2.2.1 | prod | MIT |
| cli-cursor | 5.0.0 | prod | MIT |
| cli-spinners | 3.4.0 | prod | MIT |
| cli-truncate | 6.1.1 | prod | MIT |
| cli-width | 4.1.0 | prod | ISC |
| cliui | 9.0.1 | prod | ISC |
| color-convert | 2.0.1 | prod | MIT |
| color-name | 1.1.4 | prod | MIT |
| color-support | 1.1.3 | prod | ISC |
| colorjs.io | 0.7.1 | prod | MIT |
| commander | 14.0.3 | prod | MIT |
| concat-map | 0.0.1 | prod | MIT |
| confbox | 0.2.4 | prod | MIT |
| configstore | 7.1.0 | prod | BSD-2-Clause |
| convert-source-map | 2.0.0 | prod | MIT |
| cross-spawn | 7.0.6 | prod | MIT |
| csp_evaluator | 1.1.8 | prod | Apache-2.0 |
| css-select | 7.0.0 | prod | BSD-2-Clause |
| css-tree | 3.2.1 | prod | MIT |
| css-what | 8.0.0 | prod | BSD-2-Clause |
| data-urls | 7.0.0 | prod | MIT |
| date-fns | 4.4.0 | prod | MIT |
| debug | 4.4.3 | prod | MIT |
| decimal.js | 10.6.0 | prod | MIT |
| deep-is | 0.1.4 | prod | MIT |
| default-browser | 5.5.1 | prod | MIT |
| default-browser-id | 5.0.1 | prod | MIT |
| define-lazy-prop | 3.0.0 | prod | MIT |
| defu | 6.1.7 | prod | MIT |
| destr | 2.0.5 | prod | MIT |
| detect-libc | 2.1.2 | prod | Apache-2.0 |
| devtools-protocol | 0.0.1687809 | prod | BSD-3-Clause |
| dom-serializer | 3.1.1 | prod | MIT |
| domelementtype | 3.0.0 | prod | BSD-2-Clause |
| domhandler | 6.0.1 | prod | BSD-2-Clause |
| domutils | 4.0.2 | prod | BSD-2-Clause |
| dot-prop | 9.0.0 | prod | MIT |
| dotenv | 17.4.2 | prod | BSD-2-Clause |
| electron-to-chromium | 1.5.440 | prod | ISC |
| emoji-regex | 10.6.0 | prod | MIT |
| empathic | 2.1.0 | prod | MIT |
| enquirer | 2.4.1 | prod | MIT |
| entities | 8.1.0 | prod | BSD-2-Clause |
| environment | 1.1.0 | prod | MIT |
| es-module-lexer | 2.3.2 | prod | MIT |
| esbuild | 0.28.2 | prod | MIT |
| escalade | 3.2.0 | prod | MIT |
| escape-string-regexp | 4.0.0 | prod | MIT |
| eslint | 9.39.5 | dev | MIT |
| eslint-scope | 9.1.2 | prod | BSD-2-Clause |
| eslint-visitor-keys | 5.0.1 | prod | Apache-2.0 |
| espree | 10.4.0 | prod | BSD-2-Clause |
| esquery | 1.7.0 | prod | BSD-3-Clause |
| esrecurse | 4.3.0 | prod | BSD-2-Clause |
| estraverse | 5.3.0 | prod | BSD-2-Clause |
| estree-walker | 3.0.3 | prod | MIT |
| esutils | 2.0.3 | prod | BSD-2-Clause |
| expect-type | 1.4.0 | prod | Apache-2.0 |
| exsolve | 1.1.3 | prod | MIT |
| fast-deep-equal | 3.1.3 | prod | MIT |
| fast-json-stable-stringify | 2.1.0 | prod | MIT |
| fast-levenshtein | 2.0.6 | prod | MIT |
| fast-string-truncated-width | 3.0.3 | prod | MIT |
| fast-string-width | 3.0.2 | prod | MIT |
| fast-uri | 3.1.8 | prod | BSD-3-Clause |
| fast-wrap-ansi | 0.2.2 | prod | MIT |
| fdir | 6.5.0 | prod | MIT |
| file-entry-cache | 8.0.0 | prod | MIT |
| find-up | 5.0.0 | prod | MIT |
| flat-cache | 4.0.1 | prod | MIT |
| flatpickr | 4.6.13 | prod | MIT |
| flatted | 3.4.4 | prod | ISC |
| flru | 1.0.2 | prod | MIT |
| fsevents | 2.3.3 | prod | MIT |
| gensync | 1.0.0-beta.2 | prod | MIT |
| get-caller-file | 2.0.5 | prod | ISC |
| get-east-asian-width | 1.7.0 | prod | MIT |
| get-tsconfig | 4.14.0 | prod | MIT |
| giget | 3.3.1 | prod | MIT |
| glob-parent | 6.0.2 | prod | ISC |
| globals | 14.0.0 | prod | MIT |
| graceful-fs | 4.2.11 | prod | ISC |
| has-flag | 4.0.0 | prod | MIT |
| hosted-git-info | 10.1.1 | prod | ISC |
| html-encoding-sniffer | 7.0.0 | prod | MIT |
| htmlparser2 | 12.0.0 | prod | MIT |
| http-link-header | 1.1.4 | prod | MIT |
| https-proxy-agent | 9.1.0 | prod | MIT |
| iconv-lite | 0.7.3 | prod | MIT |
| ignore | 7.0.12 | prod | MIT |
| image-ssim | 0.2.0 | prod | MIT |
| immutable | 5.1.9 | prod | MIT |
| import-fresh | 3.3.1 | prod | MIT |
| import-in-the-middle | 3.5.1 | prod | Apache-2.0 |
| import-meta-resolve | 4.2.0 | prod | MIT |
| imurmurhash | 0.1.4 | prod | MIT |
| intl-messageformat | 10.7.18 | prod | BSD-3-Clause |
| is-docker | 2.2.1 | prod | MIT |
| is-extglob | 2.1.1 | prod | MIT |
| is-fullwidth-code-point | 5.1.0 | prod | MIT |
| is-glob | 4.0.3 | prod | MIT |
| is-in-ssh | 1.0.0 | prod | MIT |
| is-inside-container | 1.0.0 | prod | MIT |
| is-interactive | 2.0.0 | prod | MIT |
| is-potential-custom-element-name | 1.0.1 | prod | MIT |
| is-unicode-supported | 2.1.0 | prod | MIT |
| is-wsl | 2.2.0 | prod | MIT |
| isexe | 2.0.0 | prod | ISC |
| jiti | 2.7.0 | prod | MIT |
| jpeg-js | 0.4.4 | prod | BSD-3-Clause |
| js-library-detector | 6.7.0 | prod | MIT |
| js-tokens | 10.0.0 | prod | MIT |
| js-yaml | 4.1.1 | prod | MIT |
| jsdom | 30.1.1 | dev | MIT |
| jsesc | 3.1.0 | prod | MIT |
| json-buffer | 3.0.1 | prod | MIT |
| json-schema-traverse | 0.4.1 | prod | MIT |
| json-stable-stringify-without-jsonify | 1.0.1 | prod | MIT |
| json5 | 2.2.3 | prod | MIT |
| jsonc-parser | 3.3.1 | prod | MIT |
| keyv | 4.5.4 | prod | MIT |
| legacy-javascript | 0.0.1 | prod | Apache-2.0 |
| levn | 0.4.1 | prod | MIT |
| lighthouse | 13.5.0 | dev | Apache-2.0 |
| lighthouse-logger | 2.0.2 | prod | Apache-2.0 |
| lighthouse-stack-packs | 1.12.3 | prod | Apache-2.0 |
| lightningcss | 1.33.0 | prod | MPL-2.0 |
| lightningcss-android-arm64 | 1.33.0 | prod | MPL-2.0 |
| lightningcss-darwin-arm64 | 1.33.0 | prod | MPL-2.0 |
| lightningcss-darwin-x64 | 1.33.0 | prod | MPL-2.0 |
| lightningcss-freebsd-x64 | 1.33.0 | prod | MPL-2.0 |
| lightningcss-linux-arm-gnueabihf | 1.33.0 | prod | MPL-2.0 |
| lightningcss-linux-arm64-gnu | 1.33.0 | prod | MPL-2.0 |
| lightningcss-linux-arm64-musl | 1.33.0 | prod | MPL-2.0 |
| lightningcss-linux-x64-gnu | 1.33.0 | prod | MPL-2.0 |
| lightningcss-linux-x64-musl | 1.33.0 | prod | MPL-2.0 |
| lightningcss-win32-arm64-msvc | 1.33.0 | prod | MPL-2.0 |
| lightningcss-win32-x64-msvc | 1.33.0 | prod | MPL-2.0 |
| listr2 | 11.1.0 | prod | MIT |
| lmdb | 3.5.6 | prod | MIT |
| locate-path | 6.0.0 | prod | MIT |
| lodash-es | 4.18.1 | prod | MIT |
| lodash.merge | 4.6.2 | prod | MIT |
| log-symbols | 7.0.1 | prod | MIT |
| log-update | 8.0.0 | prod | MIT |
| lookup-closest-locale | 6.2.0 | prod | MIT |
| lru-cache | 11.5.3 | prod | BlueOak-1.0.0 |
| magic-string | 1.4.1 | prod | MIT |
| magicast | 0.5.5 | prod | MIT |
| marky | 1.3.0 | prod | Apache-2.0 |
| mdn-data | 2.27.1 | prod | CC0-1.0 |
| mimic-function | 5.0.1 | prod | MIT |
| minimatch | 3.1.5 | prod | ISC |
| mitt | 3.0.1 | prod | MIT |
| modern-tar | 0.8.5 | prod | MIT |
| module-details-from-path | 1.0.4 | prod | MIT |
| mrmime | 2.0.1 | prod | MIT |
| ms | 2.1.3 | prod | MIT |
| msgpackr | 1.12.1 | prod | MIT |
| msgpackr-extract | 3.0.4 | prod | MIT |
| mute-stream | 3.0.0 | prod | ISC |
| nanoid | 3.3.19 | prod | MIT |
| natural-compare | 1.4.0 | prod | MIT |
| ng-cryptostore | — | prod | MIT |
| node-addon-api | 6.1.0 | prod | MIT |
| node-gyp-build-optional-packages | 5.2.2 | prod | MIT |
| node-releases | 2.0.57 | prod | MIT |
| npm-package-arg | 14.0.0 | prod | ISC |
| nth-check | 3.0.1 | prod | BSD-2-Clause |
| obug | 2.2.1 | prod | MIT |
| ohash | 2.0.12 | prod | MIT |
| onetime | 7.0.0 | prod | MIT |
| open | 11.0.0 | prod | MIT |
| optionator | 0.9.4 | prod | MIT |
| ora | 9.4.1 | prod | MIT |
| ordered-binary | 1.6.2 | prod | MIT |
| oxc-parser | 0.150.0 | prod | MIT |
| p-limit | 3.1.0 | prod | MIT |
| p-locate | 5.0.0 | prod | MIT |
| parent-module | 1.0.1 | prod | MIT |
| parse5 | 8.0.1 | prod | MIT |
| parse5-html-rewriting-stream | 8.0.1 | prod | MIT |
| parse5-sax-parser | 8.0.0 | prod | MIT |
| path-exists | 4.0.0 | prod | MIT |
| path-key | 3.1.1 | prod | MIT |
| pathe | 2.0.3 | prod | MIT |
| perfect-debounce | 2.1.0 | prod | MIT |
| picocolors | 1.1.1 | prod | ISC |
| picomatch | 4.0.7 | prod | MIT |
| piscina | 5.3.2 | prod | MIT |
| pkg-types | 2.3.3 | prod | MIT |
| playwright | 1.63.0 | prod | Apache-2.0 |
| playwright-core | 1.63.0 | prod | Apache-2.0 |
| positioning | 3.0.1 | prod | MIT |
| postcss | 8.5.28 | prod | MIT |
| postcss-media-query-parser | 0.2.3 | prod | MIT |
| postcss-safe-parser | 7.1.0 | prod | MIT |
| powershell-utils | 0.1.0 | prod | MIT |
| prelude-ls | 1.2.1 | prod | MIT |
| prettier | 3.9.9 | dev | MIT |
| proc-log | 7.0.0 | prod | ISC |
| proxy-agent-negotiate | 1.1.0 | prod | MIT |
| punycode | 2.3.1 | prod | MIT |
| puppeteer-core | 25.12.0 | prod | Apache-2.0 |
| rc9 | 3.1.0 | prod | MIT |
| readdirp | 5.1.1 | prod | MIT |
| reflect-metadata | 0.2.2 | prod | Apache-2.0 |
| require-directory | 2.1.1 | prod | MIT |
| require-from-string | 2.0.2 | prod | MIT |
| require-in-the-middle | 8.0.1 | prod | MIT |
| resolve-from | 4.0.0 | prod | MIT |
| resolve-pkg-maps | 1.0.0 | prod | MIT |
| restore-cursor | 5.1.0 | prod | MIT |
| robots-parser | 3.0.1 | prod | MIT |
| rolldown | 1.2.8 | prod | MIT |
| run-applescript | 7.1.0 | prod | MIT |
| rxjs | 7.8.2 | prod | Apache-2.0 |
| safer-buffer | 2.1.2 | prod | MIT |
| sass | 1.104.1 | prod | MIT |
| sass-embedded | 1.104.1 | prod | MIT |
| sass-embedded-all-unknown | 1.104.1 | prod | MIT |
| sass-embedded-android-arm | 1.104.1 | prod | MIT |
| sass-embedded-android-arm64 | 1.104.1 | prod | MIT |
| sass-embedded-android-riscv64 | 1.104.1 | prod | MIT |
| sass-embedded-android-x64 | 1.104.1 | prod | MIT |
| sass-embedded-darwin-arm64 | 1.104.1 | prod | MIT |
| sass-embedded-darwin-x64 | 1.104.1 | prod | MIT |
| sass-embedded-linux-arm | 1.104.1 | prod | MIT |
| sass-embedded-linux-arm64 | 1.104.1 | prod | MIT |
| sass-embedded-linux-musl-arm | 1.104.1 | prod | MIT |
| sass-embedded-linux-musl-arm64 | 1.104.1 | prod | MIT |
| sass-embedded-linux-musl-riscv64 | 1.104.1 | prod | MIT |
| sass-embedded-linux-musl-x64 | 1.104.1 | prod | MIT |
| sass-embedded-linux-riscv64 | 1.104.1 | prod | MIT |
| sass-embedded-linux-x64 | 1.104.1 | prod | MIT |
| sass-embedded-unknown-all | 1.104.1 | prod | MIT |
| sass-embedded-win32-arm64 | 1.104.1 | prod | MIT |
| sass-embedded-win32-x64 | 1.104.1 | prod | MIT |
| saxes | 6.0.0 | prod | ISC |
| semver | 7.7.4 | prod | ISC |
| shebang-command | 2.0.0 | prod | MIT |
| shebang-regex | 3.0.0 | prod | MIT |
| signal-exit | 4.1.0 | prod | ISC |
| slice-ansi | 9.0.1 | prod | MIT |
| source-map | 0.8.0 | prod | BSD-3-Clause |
| source-map-js | 1.2.2 | prod | BSD-3-Clause |
| source-map-support | 0.5.21 | prod | MIT |
| speedline-core | 1.4.3 | prod | MIT |
| std-env | 4.2.0 | prod | MIT |
| stdin-discarder | 0.3.2 | prod | MIT |
| string-width | 7.2.0 | prod | MIT |
| strip-ansi | 6.0.1 | prod | MIT |
| strip-json-comments | 3.1.1 | prod | MIT |
| stubborn-fs | 2.0.0 | prod | MIT |
| stubborn-utils | 1.0.2 | prod | MIT |
| supports-color | 7.2.0 | prod | MIT |
| sync-child-process | 1.0.2 | prod | MIT |
| sync-message-port | 1.2.0 | prod | MIT |
| third-party-web | 0.30.0 | prod | MIT |
| tinybench | 6.2.0 | prod | MIT |
| tinyexec | 1.3.1 | prod | MIT |
| tinyglobby | 0.2.17 | prod | MIT |
| tinyrainbow | 3.1.1 | prod | MIT |
| tldts | 7.4.16 | prod | MIT |
| tldts-core | 7.4.16 | prod | MIT |
| tldts-icann | 7.4.16 | prod | MIT |
| tough-cookie | 6.0.2 | prod | BSD-3-Clause |
| tr46 | 6.0.0 | prod | MIT |
| ts-api-utils | 2.5.0 | prod | MIT |
| tslib | 2.8.1 | prod | 0BSD |
| type-check | 0.4.0 | prod | MIT |
| type-fest | 4.41.0 | prod | (MIT OR CC0-1.0) |
| typed-query-selector | 2.12.2 | prod | MIT |
| typescript | 6.0.3 | dev | Apache-2.0 |
| typescript-eslint | 8.71.1 | dev | MIT |
| undici | 8.11.2 | prod | MIT |
| undici-types | 8.9.0 | prod | MIT |
| update-browserslist-db | 1.3.3 | prod | MIT |
| uri-js | 4.4.1 | prod | BSD-2-Clause |
| validate-npm-package-name | 8.0.0 | prod | ISC |
| varint | 6.0.0 | prod | MIT |
| vendor/ng-cryptostore | 21.2.0 | prod | MIT |
| verkit | 0.3.2 | prod | MIT |
| vite | 8.3.0 | prod | MIT |
| vitest | 5.0.2 | dev | MIT |
| w3c-xmlserializer | 6.0.0 | prod | MIT |
| weak-lru-cache | 1.2.2 | prod | MIT |
| web-features | 3.40.0 | prod | Apache-2.0 |
| webdriver-bidi-protocol | 0.4.3 | prod | Apache-2.0 |
| webidl-conversions | 8.0.1 | prod | BSD-2-Clause |
| whatwg-mimetype | 5.0.0 | prod | MIT |
| whatwg-url | 16.0.1 | prod | MIT |
| when-exit | 2.1.5 | prod | MIT |
| which | 2.0.2 | prod | ISC |
| why-is-node-running | 3.2.2 | prod | MIT |
| word-wrap | 1.2.5 | prod | MIT |
| wrap-ansi | 9.0.2 | prod | MIT |
| ws | 8.22.0 | prod | MIT |
| wsl-utils | 0.3.1 | prod | MIT |
| xdg-basedir | 5.1.0 | prod | MIT |
| xml-name-validator | 5.0.0 | prod | Apache-2.0 |
| xmlchars | 2.2.0 | prod | MIT |
| xxhash-wasm | 1.1.0 | prod | MIT |
| y18n | 5.0.8 | prod | ISC |
| yargs | 17.7.3 | prod | MIT |
| yargs-parser | 21.1.1 | prod | ISC |
| yocto-queue | 0.1.0 | prod | MIT |
| yoctocolors | 2.2.0 | prod | MIT |
| zod | 3.25.76 | prod | MIT |

## Runtime comparison

| From | To | Metric | From value | To value | Delta |
|---|---|---|---|---|---|
| http://127.0.0.1:4217/login | http://127.0.0.1:4200/login | first-contentful-paint | 1507.26 | 1515.50 | 8.24 |
| http://127.0.0.1:4217/login | http://127.0.0.1:4200/login | largest-contentful-paint | 1507.26 | 1515.50 | 8.24 |
| http://127.0.0.1:4217/login | http://127.0.0.1:4200/login | total-blocking-time | 229.00 | 248.00 | 19.00 |
| http://127.0.0.1:4217/login | http://127.0.0.1:4200/login | cumulative-layout-shift | 0.00 | 0.00 | 0.00 |
| http://127.0.0.1:4217/login | http://127.0.0.1:4200/login | speed-index | 10929.76 | 11156.78 | 227.02 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | first-contentful-paint | 1515.50 | 1515.39 | -0.11 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | largest-contentful-paint | 1515.50 | 1515.39 | -0.11 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | total-blocking-time | 248.00 | 250.00 | 2.00 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | cumulative-layout-shift | 0.00 | 0.00 | -0.00 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | speed-index | 11156.78 | 1515.39 | -9641.39 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | first-contentful-paint | 1515.39 | 1514.82 | -0.58 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | largest-contentful-paint | 1515.39 | 1514.82 | -0.58 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | total-blocking-time | 250.00 | 234.00 | -16.00 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | cumulative-layout-shift | 0.00 | 0.00 | -0.00 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | speed-index | 1515.39 | 11127.99 | 9612.59 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4219/login | first-contentful-paint | 1514.82 | 770.12 | -744.69 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4219/login | largest-contentful-paint | 1514.82 | 770.12 | -744.69 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4219/login | total-blocking-time | 234.00 | 97.00 | -137.00 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4219/login | cumulative-layout-shift | 0.00 | 0.00 | -0.00 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4219/login | speed-index | 11127.99 | 1712.88 | -9415.11 |
| http://127.0.0.1:4219/login | http://127.0.0.1:4200/login | first-contentful-paint | 770.12 | 769.43 | -0.69 |
| http://127.0.0.1:4219/login | http://127.0.0.1:4200/login | largest-contentful-paint | 770.12 | 769.43 | -0.69 |
| http://127.0.0.1:4219/login | http://127.0.0.1:4200/login | total-blocking-time | 97.00 | 147.43 | 50.43 |
| http://127.0.0.1:4219/login | http://127.0.0.1:4200/login | cumulative-layout-shift | 0.00 | 0.00 | 0.00 |
| http://127.0.0.1:4219/login | http://127.0.0.1:4200/login | speed-index | 1712.88 | 769.43 | -943.45 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | first-contentful-paint | 769.43 | 766.88 | -2.56 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | largest-contentful-paint | 769.43 | 766.88 | -2.56 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | total-blocking-time | 147.43 | 89.00 | -58.43 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | cumulative-layout-shift | 0.00 | 0.00 | 0.00 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | speed-index | 769.43 | 1701.05 | 931.62 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | first-contentful-paint | 766.88 | 766.89 | 0.01 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | largest-contentful-paint | 766.88 | 766.89 | 0.01 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | total-blocking-time | 89.00 | 87.50 | -1.50 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | cumulative-layout-shift | 0.00 | 0.00 | 0.00 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | speed-index | 1701.05 | 1650.00 | -51.05 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | first-contentful-paint | 766.89 | 1894.53 | 1127.65 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | largest-contentful-paint | 766.89 | 1894.53 | 1127.65 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | total-blocking-time | 87.50 | 86.00 | -1.50 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | cumulative-layout-shift | 0.00 | 0.00 | -0.00 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | speed-index | 1650.00 | 2281.69 | 631.68 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | first-contentful-paint | 1894.53 | 1899.39 | 4.86 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | largest-contentful-paint | 1894.53 | 1899.39 | 4.86 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | total-blocking-time | 86.00 | 94.00 | 8.00 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | cumulative-layout-shift | 0.00 | 0.00 | 0.00 |
| http://127.0.0.1:4200/login | http://127.0.0.1:4200/login | speed-index | 2281.69 | 2179.79 | -101.90 |

## Findings

| Severity | Confidence | Check | Location | Message | Evidence |
|---|---|---|---|---|---|
| warning | high | tool.depcheck | package.json:0 | Dependency `tslib` is not used by any source file | depcheck reported dependencies entry `tslib` as unused |
| warning | high | tool.depcheck | package.json:0 | Dependency `@angular-eslint/utils` is not used by any source file | depcheck reported devDependencies entry `@angular-eslint/utils` as unused |
| warning | high | tool.depcheck | package.json:0 | Dependency `@angular-eslint/eslint-plugin` is not used by any source file | depcheck reported devDependencies entry `@angular-eslint/eslint-plugin` as unused |
| warning | high | tool.depcheck | package.json:0 | Dependency `@angular-eslint/template-parser` is not used by any source file | depcheck reported devDependencies entry `@angular-eslint/template-parser` as unused |
| warning | high | tool.depcheck | package.json:0 | Dependency `@angular/build` is not used by any source file | depcheck reported devDependencies entry `@angular/build` as unused |
| warning | high | tool.depcheck | package.json:0 | Dependency `lighthouse` is not used by any source file | depcheck reported devDependencies entry `lighthouse` as unused |
| warning | high | tool.depcheck | package.json:0 | Dependency `@angular/compiler-cli` is not used by any source file | depcheck reported devDependencies entry `@angular/compiler-cli` as unused |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `notif.sent` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `unit.hizb_one` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `center.address` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.add_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.sum` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.date` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.live_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.no_pupils` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.expand` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.range` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `students.edit` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.chart_score` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.sum_bad` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.to_ayah` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.subtitle` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.saving` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.attachment_scroll` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.center` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.exam_average` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.name` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `cal.end` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.steps.levels.title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.save_attendance` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.no_level` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.type_term_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.student_subtitle` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `delegation.revoke` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.steps.teachers.title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.blend_hue` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.back_to_login` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.commitRate` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `cal.year` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.scope_section` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.override_tag` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.pick_teacher_type` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.no_memorization` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.day.Fri` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.appearance_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.pick_pupil` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `attendance.excused` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `news.audience` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.current` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.email_taken` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.WEIGHTS_TOTAL` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_general_official` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_session` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.custom_pos_y` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.image_mode_needs_upload` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.graduated` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.scrim_section` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.week` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.avgScore` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `weekType.study` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.replace_lead` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `center.manager` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.pattern_tint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.unsaved_title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.excellent` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.all_terms` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.back` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.prompt` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.WEIGHTS_FOREIGN` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.create_account` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.planning` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.ambient_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.season` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.change` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.background_color` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.SPAN_INVALID` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.center_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.blend_multiply` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.no_questions` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.position` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.reset` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.remove_confirm` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.gradient_to` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.your_result` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `attendance.absent` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `report.season_title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.pattern_overlay` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.level` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.pick_group` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.copied` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.save_plan` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.registrations` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.chart_status` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_date` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `app.title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.col_status` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.news` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.delete_confirm` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.cannot_delete_body` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.save_error` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.hijri` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.background_image` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.plans_title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.search_ph` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.previous_exams` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.collapse` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.delete_confirm` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.get_started` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.finish_test` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `gender.female` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.need_season` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.to_hizb` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.bg_pos_bottom_left` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.center` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.preview_card_title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.name` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.pattern_tint_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `unit.hizb_other` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.pattern_size` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.good` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.pick_student_first` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_total` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.retry` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.size` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.add_question` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.no_account` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.term_filter` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.pick_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.ACCOUNT_CENTER_REQUIRED` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.no_candidate` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `news.title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `honor.intibah` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `cal.datetime_range` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.backdrop_blur` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.gradient_preview` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.self_off_warn` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.of20` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.live_title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.students_empty` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.no_weeks` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `studentDetail.account_later` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.no_centers` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.save_variant_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.phone` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.custom_pos_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.delete` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.status` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.save_failed` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `center.name` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.scrim_color` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.lastExam` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.no_levels` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `cal.day` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.day.Thu` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.name` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.blend_darken` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.pick_group_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.background_section` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.request_sent_title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.no_student_record` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.ADMIN_LAST_ACTIVE` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.day.Mon` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.kpi_students` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `list.level` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_kicker` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `studentDetail.account_email` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_general_none` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.export_csv` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.ok` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.unassigned_only` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.centers` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `results.memorized` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `results.season` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.guide_auto` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `list.clear_search` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `news.publish` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.term` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.type_weekly_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `list.search` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.no_groups` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `examType.weekly` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.validation` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.calendar` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.exams` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `news.body` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `list.mode` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.col_teacher` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.general_avg` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `results.average` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `report.term_title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.context` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `weeklyExam.ayah_to` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.type` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `weeklyExam.hizb` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.save_variant` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.background_type` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.save` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.REPLACER_BUSY` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.repeat_repeat` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.resultsOf` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.ahzabTerm` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.progress` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.menu` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.murajaa_total` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.eyebrow` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.avgSarraj` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `attendance.late` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `notif.message` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.score_total` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.thumnWeek` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.inactive` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.auto` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.gradient_radial` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.showing` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.is_active` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.pattern_image` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.reweight` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.choose_replacer` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.myFinal` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `gender.unknown` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.delete_confirm` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.custom_size_invalid` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.RANGE_INVALID` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.save` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.day.Sat` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.choose_term_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.kpi_fill` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `results.attendance` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `center.edit` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `validation.max` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `sessionType.exam` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.bg_pos_top_right` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.student_none` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.preview_section` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.gradient_type` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.steps.pupils.title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.blend_saturation` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.separate_note` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.scores` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.blend_lighten` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.guide_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.actions` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.choose_term_short` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.studentName` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.no_season` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `delegation.revoked` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_exam` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.forbidden` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.ambient_primary` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `unit.hizb_few` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `honor.none` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.paused` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.new` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `audience.teachers` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.close` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.today` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.repeat_round` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.pick_term` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.sessions` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.no_result_short` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_review_date` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.tab_general` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `registrations.cancel_confirm` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.birth_date` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.thisMonth` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.weight` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.chart_mode` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.print` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.request_sent_body` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.in_waiting_room` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.col_att` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.repeat_repeat_x` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.season` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_missing_zero` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.paper_title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.blend_color_dodge` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.thumn` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.questions` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.teacher_kind` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `delegation.granted` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.students_title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.appearance_section` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.need_portion` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.steps.levels.desc` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.background_mode_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.full_recitation` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.active` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `registrations.requested` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `role.admin` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.pick_season` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.weights` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.preview_desktop` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.dashboard` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.scrim_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.layer_off` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.day.Tue` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.error_title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.support` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.ahzabDawra` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `weekType.review` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.read_from` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `cal.prev` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.name` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `validation.range` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.later` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.unsaved_warn` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.empty` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.reset_confirm` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.open` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.over_max` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.layout_controls` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `delegation.generate` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.day.Wed` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.scrim_enabled` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.students` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.repeat_space` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.steps.season.title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.add_question_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.pick_pupil_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.bg_type_image` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.distribution` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.cannot_delete_title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.delegate` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.gradient_from` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.session_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.phone` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.preview_card_line` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.exam_score` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.today` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `validation.required` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.custom_size_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.preview_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.honor` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.in_total` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.layers_section` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.steps.centers.desc` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.retry` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.blend_overlay` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.need_term` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `examType.term_batch` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.scrim_opacity` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `audience.manager` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.password` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.saved` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.bg_size_fill` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `studentStatus.left` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.chart_trend` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.to_surah` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.teacher_type` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.copy_css` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.guide_section` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_no_exam` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `weeklyExam.ayah_from` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `sessionStatus.done` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.code` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.pickStudent` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.q_no` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.create` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `role.teacher` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.invalid` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.gender` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.opacity` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.table_title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.blend_soft_light` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.TERM_REQUIRED` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.subtitle` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.center` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.pattern_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.monthlyEval` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.current_week` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.glass_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `notif.send` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `audience.my_students` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.col_gender` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.staff_subtitle` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.selected_variant` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.progress` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `validation.min` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.results` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.self_off_confirm` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.close_result` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.CROSS_CENTER` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.steps.groups.desc` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.score` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.new_season` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.css_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.week_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.memorized_label` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.form_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.pick_gender` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `delegation.send_wa` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.breadcrumb` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `review.practice` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.ADMIN_DELETE` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.type_child` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.reset` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.chart_att` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.repeat_no_repeat` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.supervisor_note` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.toast_uploaded` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.glass_opacity` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `center.stats` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.hide_password` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.bg_type_none` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.from_surah` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.settings` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `notif.failed` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.discard` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.hifz_total` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `weeklyExam.portion` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `list.no_results` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.remove` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.no_exams` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `studentDetail.account_create` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.season_title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.subtitle` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.review_weeks` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `cal.month` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.active` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.goal_breakdown` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.edit` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `cal.week` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.scoring` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.pick_student` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.GROUP_ROLE` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.col_mode` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `studentStatus.active` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.notifications` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `delegation.share_once` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.total_memorized` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.expected_term` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_score` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.bg_type_color` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.details` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `results.final` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `studentDetail.account` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.birth_date` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.bg_pos_top_left` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.totalAhzab` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.ayah_from` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `report.print` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.self_admin_locked` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.loading` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `role.supervisor` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.unavailable_short` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.schedule` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.from_hizb` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.code` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.teacher_notes` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `sessionStatus.planned` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.shared` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `weeklyExam.total` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `registrations.accept_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `studentDetail.pick_account` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.password` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.show_center_id` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.students_error` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.blend_screen` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.scope_center` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.score` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.no_sessions` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.attachment_fixed` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.ayah_to` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.name` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.add_result` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.total` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.pattern_enabled` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `audience.all` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.steps.centers.title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.display_section` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.ambient_enabled` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.from_ayah` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.reports` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.chart_fill` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.weekly_title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `mode.surah` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `review.new_cycle` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.INVALID_CREDENTIALS` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.col_score` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_reviews` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_no_murajaa` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.role` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.create` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.col_fill` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.email` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.guide_reset` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `list.total` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.no_result_title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.replace_title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `center.phone` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.LEVEL_EXISTS` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.hide_scopes_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.pick_student_card_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.whatsapp` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.start_date` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `studentStatus.paused` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.ambient_intensity` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.layers_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `delegation.invalid` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `delegation.copy` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.entry` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_hifz` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.new` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `notif.queued` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `role.student` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.bg_size_cover` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.board` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.surah` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `notif.queue` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.uploading` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.from_ayah` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.start_hizb` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `examType.final_season` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.no_center` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.last_memorization` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.advanced` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.thumnSession` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `registrations.cancel` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `examType.hizb_completion` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.day.Sun` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.sum_ok` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.kpi_attendance` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `registrations.pick_center` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.center` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.blend_difference` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.blend_luminosity` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.to_ayah` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.load_existing` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.max` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.toast_saved` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.source_manual` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.MODULE_HAS_SCORES` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.bg_pos_right` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.pick_group` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.chart_dist` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `notif.title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.login` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.evaluation` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.teacher_type` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `delegation.minutes` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.use_template` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.logout` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.col_students` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.bg_pos_bottom_right` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.background_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.reviews` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `registrations.title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_week` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.weeks_unit` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.review_only_notice` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.replace_cleanup` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.go` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.pick_week` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.goal` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.users` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.cancel` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.sum_bad_server` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `list.pager_next` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.blend_hard_light` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.attendance` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.year` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.filter_type` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.subjects` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.test_portion` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.groups` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `studentDetail.account_link` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_max` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.planned_date` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.SESSION_TIME_ORDER` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.unsaved` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `weeklyExam.surah` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.edit_result` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.ADMIN_ONLY` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.model2` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.REPLACER_INACTIVE` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `weeklyExam.need_group` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.theme` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.repeat` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.preview_phone` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `teacher_type.hifz` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.show_cal_debug` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_murajaa` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.confirm_password` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.create` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.chart_gender` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.left` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.active` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `center.title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.clear_filters` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.show_center_id_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `sessionType.memorization` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_official_value` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.last6` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.LEVEL_IN_USE` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.end_date` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.bg_pos_left` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_question` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.center_loading` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `cal.next` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.notFound` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.load_error` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.choose_term` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.thumnSessionLabel` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.levels` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.back_to_students` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.hello_again` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `registrations.pick_group` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.enrolled` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.server` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.repeat_repeat_y` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.glass_section` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.scope_shared` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.pick_replacer` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `honor.tashji3` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.ADMIN_SELF_DISABLE` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.inactive` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.have_account` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.notes` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.show_password` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.SEASON_EXISTS` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.currentSurah` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.status` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `review.week_from` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `news.edit` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.pick_session` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.current_portion` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.image_help` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.col_type` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.blend_exclusion` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.no_background` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.bg_pos_center` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.blend_mode` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.steps.season.desc` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.recovery` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.edit_season` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.average` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.open` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `studentStatus.graduated` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.no_groups` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.search` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.create_test` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.no_season` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_sum` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `center.create` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.choose_image` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.steps.pupils.desc` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `app.subtitle` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.need_student` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `teacher_type.murajaa` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `review.cycles` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.ambient_secondary` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `gender.male` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.gradient_conic` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `cal.start` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.save_selected` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `registrations.accept` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.overall` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.col_name` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_general_exam_source` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `students.unassigned_only` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.show_cal_debug_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.totalStudents` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.register` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.gradient_angle` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.unsaved_leave` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.error` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.goal_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `list.group` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `role.board` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.goal` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `list.status` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.gradient_linear` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.next` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.edit` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_entered` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.controls_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.review_weeks` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.inherited_tag` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.study_weeks` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.pattern_invert` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.pick_role` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.result` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.default_pattern` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.ambient_section` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.all_memorization` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.email` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.phone` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.bg_type_gradient` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_questions` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `attendance.present` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `validation.code_pattern` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.replace_confirm` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.activate` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.bg_size_contain` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.PLACEMENT_REQUIRED` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.model1` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.scrim_theme_color_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.toast_removed` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.bg_pos_top` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `sessionStatus.cancelled` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.terms` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.SEASON_HAS_FACTS` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.guide_auto_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `weeklyExam.thumn` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `weeklyExam.group` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.scope` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.chart_type` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.col_thumn` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `students.create` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `list.pager_prev` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `cal.today` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.guide_open` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.activeGroups` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.start_test` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.blend_color_burn` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.main` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.password_mismatch` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scopeType.weekly` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.tab_appearance` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.type_adult` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.SCORING_TOTAL` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.group_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.save_scores` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `teacher_type.both` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.LEVEL_SOURCE_MISSING` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `report.term` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.steps.teachers.desc` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `delegation.title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `center.city` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.unknown` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.pattern_tint_color` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.bg_size_custom` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.image_too_large` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.students_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.pick_student_card_title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.scrim_theme_color` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.source_last_log` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scopeType.murajaa` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.term_title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.bg_size_tile` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `common.error` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `studentDetail.account_mode` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.replace_image` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.students_count` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.OWN_STUDENTS` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.my_exams_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.duration` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.live_need` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `weeklyExam.need_portion` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.REPLACER_CENTER` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.reset_confirm` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `unit.hizb_two` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.students_title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_sessions` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.blend_color` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.custom_pos_x` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.bg_pos_bottom` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.expected_week` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.glass_tint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `setup.steps.groups.title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `studentDetail.account_create_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.filters` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.studentsTitle` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.type_hizb_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.attachment` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `review.week_to` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `studentDetail.assign_group` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `notif.phone` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.hizb` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.source_last_exam` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.light` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.rename_term` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.bg_pos_custom` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.blend_normal` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_general` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.builder_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.image_type` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.saved` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `mode.thumn` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.kpi_avg` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.edit` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `studentDetail.account_password` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.memorized_label` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.quranSessions` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `review.title` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.target_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.role_filter` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.col_capacity` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `users.role` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.kpi_groups` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.delete_confirm` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.REPLACER_SELF` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.NEED_REPLACER` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.copy_failed` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.center_locked` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_average` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.hide_scopes` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `entry.done` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `weeklyExam.saved` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_open` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `scoring.add_book` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `settings.custom_pos_invalid` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `auth.language` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `grp.empty_students` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.SCORE_OVER_MAX` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `dash.noPupil` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `apiErrors.REPLACER_TYPE` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.khatm` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `sessionType.revision` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `nav.dark` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `planning.sessions_n` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `level.scope_season` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `result.audit_prompt` is declared but never used | no translate.instant/get usage found |
| warning | medium | i18n.unused-keys | public/assets/i18n/en.json:1 | Translation key `exam.type_final_hint` is declared but never used | no translate.instant/get usage found |
| warning | medium | clone.function | e2e/api.ts:25 | Function `loginAs` shares 71 normalized block(s) with `login` in scripts/audit-responsive.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | e2e/api.ts:25 | Function `loginAs` shares 71 normalized block(s) with `login` in scripts/shots.mjs | function-level Type-2 shingles |
| critical | medium | security.hardcoded-secret | e2e/api.ts:85 | Potential hardcoded secret (generic secret literal) — verify and remove from source | secret value intentionally redacted |
| warning | medium | clone.function | e2e/api.ts:101 | Function `fillStable` shares 19 normalized block(s) with `stableFill` in scripts/audit-responsive.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | e2e/api.ts:101 | Function `fillStable` shares 19 normalized block(s) with `stableFill` in scripts/shots.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | e2e/api.ts:115 | Function `apiNames` shares 6 normalized block(s) with `total` in e2e/bootstrap-flow.e2e.ts | function-level Type-2 shingles |
| critical | medium | security.hardcoded-secret | e2e/api.ts:125 | Potential hardcoded secret (generic secret literal) — verify and remove from source | secret value intentionally redacted |
| warning | medium | tool.jscpd | e2e/auth-flow.e2e.ts:13 | Copy-paste clone with `e2e\groups-flow.e2e.ts`:12 | jscpd: 7 lines, 58 tokens |
| warning | medium | tool.jscpd | e2e/auth-flow.e2e.ts:13 | Copy-paste clone with `e2e\settings-flow.e2e.ts`:69 | jscpd: 10 lines, 71 tokens |
| warning | medium | tool.jscpd | e2e/auth-flow.e2e.ts:13 | Copy-paste clone with `e2e\settings-flow.e2e.ts`:117 | jscpd: 10 lines, 71 tokens |
| warning | medium | tool.jscpd | e2e/auth-flow.e2e.ts:13 | Copy-paste clone with `e2e\news-flow.e2e.ts`:8 | jscpd: 10 lines, 71 tokens |
| warning | medium | tool.jscpd | e2e/auth-flow.e2e.ts:13 | Copy-paste clone with `e2e\scoring-flow.e2e.ts`:7 | jscpd: 10 lines, 71 tokens |
| warning | medium | tool.jscpd | e2e/auth-flow.e2e.ts:13 | Copy-paste clone with `e2e\centers-flow.e2e.ts`:9 | jscpd: 10 lines, 66 tokens |
| warning | medium | tool.jscpd | e2e/auth-flow.e2e.ts:13 | Copy-paste clone with `e2e\settings-flow.e2e.ts`:10 | jscpd: 10 lines, 67 tokens |
| warning | medium | tool.jscpd | e2e/auth-flow.e2e.ts:13 | Copy-paste clone with `e2e\auth-flow.e2e.ts`:46 | jscpd: 10 lines, 69 tokens |
| warning | medium | tool.jscpd | e2e/auth-flow.e2e.ts:14 | Copy-paste clone with `e2e\levels-flow.e2e.ts`:191 | jscpd: 9 lines, 62 tokens |
| warning | medium | tool.jscpd | e2e/auth-flow.e2e.ts:15 | Copy-paste clone with `e2e\students-flow.e2e.ts`:13 | jscpd: 9 lines, 67 tokens |
| critical | medium | security.hardcoded-secret | e2e/bootstrap-flow.e2e.ts:28 | Potential hardcoded secret (generic secret literal) — verify and remove from source | secret value intentionally redacted |
| warning | medium | tool.jscpd | e2e/bootstrap-flow.e2e.ts:48 | Copy-paste clone with `e2e\users-flow.e2e.ts`:153 | jscpd: 7 lines, 57 tokens |
| warning | medium | tool.jscpd | e2e/bootstrap-flow.e2e.ts:49 | Copy-paste clone with `e2e\users-flow.e2e.ts`:46 | jscpd: 6 lines, 50 tokens |
| warning | medium | clone.function | e2e/bootstrap-flow.e2e.ts:82 | Function `registerPupil` shares 10 normalized block(s) with `acceptStudent` in e2e/calendar-access.e2e.ts | function-level Type-2 shingles |
| warning | medium | clone.function | e2e/bootstrap-flow.e2e.ts:82 | Function `registerPupil` shares 58 normalized block(s) with `registerStudent` in e2e/calendar-access.e2e.ts | function-level Type-2 shingles |
| warning | medium | tool.jscpd | e2e/bootstrap-flow.e2e.ts:164 | Copy-paste clone with `e2e\seasons-flow.e2e.ts`:21 | jscpd: 10 lines, 70 tokens |
| warning | medium | tool.jscpd | e2e/bootstrap-flow.e2e.ts:176 | Copy-paste clone with `e2e\seasons-flow.e2e.ts`:42 | jscpd: 6 lines, 50 tokens |
| warning | medium | tool.jscpd | e2e/bootstrap-flow.e2e.ts:203 | Copy-paste clone with `e2e\users-flow.e2e.ts`:172 | jscpd: 9 lines, 60 tokens |
| warning | medium | tool.jscpd | e2e/bootstrap-flow.e2e.ts:218 | Copy-paste clone with `e2e\groups-flow.e2e.ts`:97 | jscpd: 8 lines, 53 tokens |
| warning | medium | tool.jscpd | e2e/bootstrap-flow.e2e.ts:244 | Copy-paste clone with `e2e\calendar-access.e2e.ts`:91 | jscpd: 6 lines, 64 tokens |
| warning | medium | tool.jscpd | e2e/bootstrap-flow.e2e.ts:249 | Copy-paste clone with `e2e\calendar-access.e2e.ts`:95 | jscpd: 14 lines, 150 tokens |
| warning | medium | tool.jscpd | e2e/bootstrap-flow.e2e.ts:252 | Copy-paste clone with `e2e\registrations-flow.e2e.ts`:54 | jscpd: 9 lines, 77 tokens |
| warning | medium | tool.jscpd | e2e/calendar-access.e2e.ts:72 | Copy-paste clone with `e2e\registrations-flow.e2e.ts`:15 | jscpd: 10 lines, 153 tokens |
| warning | medium | tool.jscpd | e2e/calendar-access.e2e.ts:77 | Copy-paste clone with `e2e\registrations-flow.e2e.ts`:34 | jscpd: 6 lines, 74 tokens |
| warning | medium | tool.jscpd | e2e/calendar-access.e2e.ts:129 | Copy-paste clone with `e2e\calendar-access.e2e.ts`:216 | jscpd: 9 lines, 83 tokens |
| warning | medium | tool.jscpd | e2e/calendar-access.e2e.ts:145 | Copy-paste clone with `e2e\calendar-access.e2e.ts`:185 | jscpd: 13 lines, 88 tokens |
| warning | medium | tool.jscpd | e2e/calendar-access.e2e.ts:161 | Copy-paste clone with `e2e\settings-flow.e2e.ts`:74 | jscpd: 6 lines, 62 tokens |
| warning | medium | tool.jscpd | e2e/calendar-access.e2e.ts:165 | Copy-paste clone with `e2e\user-safety-flow.e2e.ts`:88 | jscpd: 9 lines, 110 tokens |
| warning | medium | tool.jscpd | e2e/calendar-access.e2e.ts:166 | Copy-paste clone with `e2e\settings-flow.e2e.ts`:80 | jscpd: 13 lines, 145 tokens |
| warning | medium | tool.jscpd | e2e/calendar-access.e2e.ts:166 | Copy-paste clone with `e2e\users-flow.e2e.ts`:32 | jscpd: 10 lines, 120 tokens |
| warning | medium | tool.jscpd | e2e/calendar-access.e2e.ts:170 | Copy-paste clone with `e2e\user-safety-flow.e2e.ts`:47 | jscpd: 7 lines, 73 tokens |
| warning | medium | tool.jscpd | e2e/calendar-access.e2e.ts:172 | Copy-paste clone with `e2e\users-flow.e2e.ts`:97 | jscpd: 7 lines, 50 tokens |
| warning | medium | tool.jscpd | e2e/calendar-access.e2e.ts:179 | Copy-paste clone with `e2e\calendar-access.e2e.ts`:215 | jscpd: 7 lines, 59 tokens |
| warning | medium | tool.jscpd | e2e/calendar-access.e2e.ts:197 | Copy-paste clone with `e2e\settings-flow.e2e.ts`:103 | jscpd: 15 lines, 130 tokens |
| warning | medium | tool.jscpd | e2e/calendar-access.e2e.ts:198 | Copy-paste clone with `e2e\users-flow.e2e.ts`:86 | jscpd: 6 lines, 53 tokens |
| warning | medium | tool.jscpd | e2e/calendar-access.e2e.ts:211 | Copy-paste clone with `e2e\calendar-access.e2e.ts`:288 | jscpd: 30 lines, 248 tokens |
| warning | medium | tool.jscpd | e2e/calendar-access.e2e.ts:219 | Copy-paste clone with `e2e\calendar-access.e2e.ts`:296 | jscpd: 23 lines, 185 tokens |
| warning | medium | tool.jscpd | e2e/calendar-access.e2e.ts:268 | Copy-paste clone with `e2e\calendar-access.e2e.ts`:332 | jscpd: 21 lines, 187 tokens |
| warning | medium | tool.jscpd | e2e/calendar-access.e2e.ts:368 | Copy-paste clone with `e2e\settings-flow.e2e.ts`:149 | jscpd: 7 lines, 58 tokens |
| warning | medium | tool.jscpd | e2e/calendar-access.e2e.ts:368 | Copy-paste clone with `e2e\settings-flow.e2e.ts`:130 | jscpd: 7 lines, 58 tokens |
| warning | medium | tool.jscpd | e2e/calendar-drag.e2e.ts:35 | Copy-paste clone with `e2e\calendar-resize.e2e.ts`:20 | jscpd: 32 lines, 249 tokens |
| warning | medium | tool.jscpd | e2e/calendar-drag.e2e.ts:66 | Copy-paste clone with `e2e\calendar-resize.e2e.ts`:50 | jscpd: 14 lines, 133 tokens |
| warning | medium | tool.jscpd | e2e/calendar-drag.e2e.ts:80 | Copy-paste clone with `e2e\calendar-resize.e2e.ts`:69 | jscpd: 24 lines, 153 tokens |
| warning | medium | clone.function | e2e/calendar-drag.e2e.ts:90 | Function `restore` shares 16 normalized block(s) with `restore` in e2e/calendar-resize.e2e.ts | function-level Type-2 shingles |
| critical | medium | security.hardcoded-secret | e2e/calendar-drag.e2e.ts:97 | Potential hardcoded secret (generic secret literal) — verify and remove from source | secret value intentionally redacted |
| warning | medium | tool.jscpd | e2e/calendar-drag.e2e.ts:130 | Copy-paste clone with `e2e\calendar-drag.e2e.ts`:189 | jscpd: 6 lines, 54 tokens |
| warning | medium | tool.jscpd | e2e/calendar-drag.e2e.ts:143 | Copy-paste clone with `e2e\calendar-drag.e2e.ts`:205 | jscpd: 11 lines, 88 tokens |
| warning | medium | tool.jscpd | e2e/calendar-drag.e2e.ts:177 | Copy-paste clone with `e2e\calendar-resize.e2e.ts`:63 | jscpd: 6 lines, 64 tokens |
| warning | medium | tool.jscpd | e2e/calendar-drag.e2e.ts:198 | Copy-paste clone with `e2e\calendar-resize.e2e.ts`:119 | jscpd: 13 lines, 110 tokens |
| warning | medium | tool.jscpd | e2e/calendar-drag.e2e.ts:199 | Copy-paste clone with `e2e\calendar-resize.e2e.ts`:166 | jscpd: 12 lines, 97 tokens |
| critical | medium | security.hardcoded-secret | e2e/calendar-resize.e2e.ts:86 | Potential hardcoded secret (generic secret literal) — verify and remove from source | secret value intentionally redacted |
| warning | medium | tool.jscpd | e2e/calendar-resize.e2e.ts:93 | Copy-paste clone with `e2e\calendar-resize.e2e.ts`:143 | jscpd: 17 lines, 92 tokens |
| warning | medium | tool.jscpd | e2e/calendar-resize.e2e.ts:126 | Copy-paste clone with `e2e\calendar-resize.e2e.ts`:172 | jscpd: 9 lines, 68 tokens |
| warning | medium | tool.jscpd | e2e/centers-flow.e2e.ts:7 | Copy-paste clone with `e2e\levels-flow.e2e.ts`:61 | jscpd: 10 lines, 72 tokens |
| warning | medium | tool.jscpd | e2e/centers-flow.e2e.ts:8 | Copy-paste clone with `e2e\exams-flow.e2e.ts`:7 | jscpd: 7 lines, 62 tokens |
| warning | medium | tool.jscpd | e2e/entry-flow.e2e.ts:92 | Copy-paste clone with `e2e\entry-flow.e2e.ts`:133 | jscpd: 8 lines, 58 tokens |
| warning | medium | tool.jscpd | e2e/exams-cut.e2e.ts:9 | Copy-paste clone with `e2e\exams-flow.e2e.ts`:13 | jscpd: 20 lines, 181 tokens |
| warning | medium | tool.jscpd | e2e/exams-cut.e2e.ts:42 | Copy-paste clone with `e2e\exams-flow.e2e.ts`:45 | jscpd: 8 lines, 53 tokens |
| warning | medium | tool.jscpd | e2e/exams-cut.e2e.ts:46 | Copy-paste clone with `e2e\exams-flow.e2e.ts`:54 | jscpd: 7 lines, 55 tokens |
| warning | medium | clone.function | e2e/groups-flow.e2e.ts:12 | Function `login` shares 9 normalized block(s) with `login` in scripts/_probe-zebra.mjs | function-level Type-2 shingles |
| warning | medium | tool.jscpd | e2e/groups-flow.e2e.ts:94 | Copy-paste clone with `e2e\users-flow.e2e.ts`:180 | jscpd: 8 lines, 55 tokens |
| warning | medium | tool.jscpd | e2e/levels-flow.e2e.ts:65 | Copy-paste clone with `e2e\levels-flow.e2e.ts`:192 | jscpd: 10 lines, 82 tokens |
| warning | medium | tool.jscpd | e2e/levels-flow.e2e.ts:78 | Copy-paste clone with `e2e\levels-flow.e2e.ts`:199 | jscpd: 14 lines, 134 tokens |
| warning | medium | tool.jscpd | e2e/levels-flow.e2e.ts:189 | Copy-paste clone with `e2e\seasons-flow.e2e.ts`:15 | jscpd: 9 lines, 63 tokens |
| warning | medium | tool.jscpd | e2e/levels-flow.e2e.ts:189 | Copy-paste clone with `e2e\students-flow.e2e.ts`:10 | jscpd: 9 lines, 63 tokens |
| warning | medium | tool.jscpd | e2e/levels-flow.e2e.ts:189 | Copy-paste clone with `e2e\seasons-flow.e2e.ts`:62 | jscpd: 9 lines, 61 tokens |
| warning | medium | tool.jscpd | e2e/levels-flow.e2e.ts:221 | Copy-paste clone with `e2e\levels-flow.e2e.ts`:266 | jscpd: 7 lines, 53 tokens |
| warning | high | structure.complexity | e2e/results-reports-flow.e2e.ts:6 | Function `pickStudent` function length 112 lines exceeds 80 | cyclomatic=4 · cognitive=7 · loc=112 |
| warning | medium | tool.jscpd | e2e/results-reports-flow.e2e.ts:53 | Copy-paste clone with `e2e\results-reports-flow.e2e.ts`:67 | jscpd: 7 lines, 77 tokens |
| warning | medium | tool.jscpd | e2e/reviews-flow.e2e.ts:35 | Copy-paste clone with `e2e\reviews-flow.e2e.ts`:54 | jscpd: 9 lines, 84 tokens |
| critical | medium | security.hardcoded-secret | e2e/seasons-flow.e2e.ts:13 | Potential hardcoded secret (generic secret literal) — verify and remove from source | secret value intentionally redacted |
| warning | medium | tool.jscpd | e2e/settings-flow.e2e.ts:79 | Copy-paste clone with `e2e\users-flow.e2e.ts`:159 | jscpd: 6 lines, 67 tokens |
| warning | medium | tool.jscpd | e2e/settings-flow.e2e.ts:131 | Copy-paste clone with `e2e\settings-flow.e2e.ts`:150 | jscpd: 8 lines, 55 tokens |
| warning | medium | tool.jscpd | e2e/unsaved-flow.e2e.ts:5 | Copy-paste clone with `e2e\unsaved-flow.e2e.ts`:27 | jscpd: 13 lines, 95 tokens |
| warning | medium | tool.jscpd | e2e/user-safety-flow.e2e.ts:12 | Copy-paste clone with `e2e\user-safety-flow.e2e.ts`:24 | jscpd: 9 lines, 91 tokens |
| warning | medium | tool.jscpd | e2e/user-safety-flow.e2e.ts:95 | Copy-paste clone with `e2e\users-flow.e2e.ts`:96 | jscpd: 11 lines, 50 tokens |
| warning | medium | tool.jscpd | e2e/user-safety-flow.e2e.ts:109 | Copy-paste clone with `e2e\users-flow.e2e.ts`:112 | jscpd: 12 lines, 62 tokens |
| info | medium | git.churn-hotspot | e2e/users-flow.e2e.ts:1 | Churn hotspot: 13 changes across 245 LOC (score 103) | git churn × function complexity |
| warning | medium | tool.jscpd | e2e/users-flow.e2e.ts:30 | Copy-paste clone with `e2e\users-flow.e2e.ts`:52 | jscpd: 18 lines, 134 tokens |
| warning | medium | tool.knip | eslint.config.mjs:4 | Knip: unlisted dependency `@eslint/js` | knip category: unlisted |
| warning | medium | tool.jscpd | package-lock.json:9 | Copy-paste clone with `package.json`:40 | jscpd: 40 lines, 148 tokens |
| warning | medium | tool.jscpd | package-lock.json:366 | Copy-paste clone with `package-lock.json`:9730 | jscpd: 68 lines, 191 tokens |
| warning | medium | tool.jscpd | package-lock.json:1664 | Copy-paste clone with `package-lock.json`:6157 | jscpd: 17 lines, 55 tokens |
| warning | medium | tool.jscpd | package-lock.json:2088 | Copy-paste clone with `package-lock.json`:2380 | jscpd: 21 lines, 58 tokens |
| warning | medium | tool.jscpd | package-lock.json:2112 | Copy-paste clone with `package-lock.json`:2238 | jscpd: 19 lines, 50 tokens |
| warning | medium | tool.jscpd | package-lock.json:2112 | Copy-paste clone with `package-lock.json`:2260 | jscpd: 19 lines, 50 tokens |
| warning | medium | tool.jscpd | package-lock.json:2112 | Copy-paste clone with `package-lock.json`:2184 | jscpd: 19 lines, 50 tokens |
| warning | medium | tool.jscpd | package-lock.json:2112 | Copy-paste clone with `package-lock.json`:2335 | jscpd: 19 lines, 50 tokens |
| warning | medium | tool.knip | package.json:60 | Knip: unused dev dependency `@angular-eslint/eslint-plugin` | knip category: devDependencies |
| warning | medium | tool.knip | package.json:61 | Knip: unused dev dependency `@angular-eslint/template-parser` | knip category: devDependencies |
| warning | medium | tool.knip | package.json:62 | Knip: unused dev dependency `@angular-eslint/utils` | knip category: devDependencies |
| warning | medium | tool.knip | package.json:74 | Knip: unused dev dependency `lighthouse` | knip category: devDependencies |
| warning | medium | tool.knip | scripts/_auth-baseline.mjs:1 | Knip: unused file `scripts/_auth-baseline.mjs` | knip category: files |
| warning | medium | tool.jscpd | scripts/_auth-baseline.mjs:7 | Copy-paste clone with `scripts\shots.mjs`:22 | jscpd: 8 lines, 51 tokens |
| warning | medium | tool.jscpd | scripts/_auth-baseline.mjs:8 | Copy-paste clone with `scripts\_probe.mjs`:10 | jscpd: 11 lines, 69 tokens |
| warning | medium | tool.jscpd | scripts/_auth-baseline.mjs:8 | Copy-paste clone with `scripts\_probe-phase5.mjs`:10 | jscpd: 11 lines, 71 tokens |
| warning | medium | tool.jscpd | scripts/_auth-baseline.mjs:27 | Copy-paste clone with `scripts\_probe-phase5.mjs`:27 | jscpd: 27 lines, 154 tokens |
| warning | medium | clone.function | scripts/_auth-baseline.mjs:29 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/_probe-tablet.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/_auth-baseline.mjs:29 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/_probe-zebra.mjs | function-level Type-2 shingles |
| warning | medium | tool.jscpd | scripts/_auth-baseline.mjs:29 | Copy-paste clone with `scripts\audit-responsive.mjs`:93 | jscpd: 25 lines, 152 tokens |
| warning | medium | clone.function | scripts/_auth-baseline.mjs:29 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/_probe.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/_auth-baseline.mjs:29 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/_probe-phase5.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/_auth-baseline.mjs:53 | Function `main` shares 167 normalized block(s) with `main` in scripts/_probe.mjs | function-level Type-2 shingles |
| warning | high | structure.complexity | scripts/_auth-baseline.mjs:53 | Function `main` cyclomatic complexity 12 exceeds 10 | cyclomatic=12 · cognitive=17 · loc=87 |
| warning | medium | clone.function | scripts/_auth-baseline.mjs:53 | Function `main` shares 131 normalized block(s) with `main` in scripts/_probe-phase5.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/_auth-baseline.mjs:53 | Function `main` shares 127 normalized block(s) with `main` in scripts/_probe-tablet.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/_auth-baseline.mjs:53 | Function `main` shares 91 normalized block(s) with `main` in scripts/_probe-zebra.mjs | function-level Type-2 shingles |
| warning | medium | tool.jscpd | scripts/_auth-baseline.mjs:59 | Copy-paste clone with `scripts\_probe-phase5.mjs`:151 | jscpd: 31 lines, 171 tokens |
| warning | medium | tool.jscpd | scripts/_auth-baseline.mjs:72 | Copy-paste clone with `scripts\_probe-tablet.mjs`:131 | jscpd: 22 lines, 142 tokens |
| warning | medium | tool.jscpd | scripts/_auth-baseline.mjs:75 | Copy-paste clone with `scripts\shots.mjs`:466 | jscpd: 17 lines, 110 tokens |
| warning | medium | tool.jscpd | scripts/_auth-baseline.mjs:79 | Copy-paste clone with `scripts\audit-responsive.mjs`:299 | jscpd: 15 lines, 87 tokens |
| warning | medium | tool.jscpd | scripts/_auth-baseline.mjs:79 | Copy-paste clone with `scripts\_probe.mjs`:150 | jscpd: 15 lines, 87 tokens |
| warning | medium | tool.jscpd | scripts/_auth-baseline.mjs:135 | Copy-paste clone with `scripts\audit-responsive.mjs`:360 | jscpd: 11 lines, 56 tokens |
| warning | medium | tool.jscpd | scripts/_auth-baseline.mjs:135 | Copy-paste clone with `scripts\_probe-phase5.mjs`:343 | jscpd: 11 lines, 55 tokens |
| warning | medium | tool.jscpd | scripts/_auth-baseline.mjs:136 | Copy-paste clone with `scripts\shots.mjs`:587 | jscpd: 10 lines, 54 tokens |
| warning | medium | clone.type2 | scripts/_probe-phase5.mjs:1 | Type-2 (renamed) clone: scripts/_probe-phase5.mjs shares 309 normalized token block(s) with scripts/_probe.mjs | Type-2 (renamed) clone: 40 tokens, 309 shared blocks |
| warning | medium | tool.knip | scripts/_probe-phase5.mjs:1 | Knip: unused file `scripts/_probe-phase5.mjs` | knip category: files |
| warning | medium | tool.jscpd | scripts/_probe-phase5.mjs:9 | Copy-paste clone with `scripts\_probe-tablet.mjs`:5 | jscpd: 55 lines, 360 tokens |
| warning | medium | tool.jscpd | scripts/_probe-phase5.mjs:9 | Copy-paste clone with `scripts\audit-responsive.mjs`:13 | jscpd: 12 lines, 83 tokens |
| warning | medium | tool.jscpd | scripts/_probe-phase5.mjs:13 | Copy-paste clone with `scripts\_probe.mjs`:13 | jscpd: 50 lines, 325 tokens |
| warning | medium | tool.jscpd | scripts/_probe-phase5.mjs:14 | Copy-paste clone with `scripts\_probe-zebra.mjs`:14 | jscpd: 38 lines, 244 tokens |
| warning | medium | clone.function | scripts/_probe-phase5.mjs:29 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/_probe-zebra.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/_probe-phase5.mjs:29 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/_probe.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/_probe-phase5.mjs:29 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/_probe-tablet.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/_probe-phase5.mjs:40 | Function `waitFor` shares 25 normalized block(s) with `waitFor` in scripts/_probe-zebra.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/_probe-phase5.mjs:40 | Function `waitFor` shares 25 normalized block(s) with `waitFor` in scripts/_probe-tablet.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/_probe-phase5.mjs:40 | Function `waitFor` shares 25 normalized block(s) with `waitFor` in scripts/_probe.mjs | function-level Type-2 shingles |
| warning | medium | tool.jscpd | scripts/_probe-phase5.mjs:43 | Copy-paste clone with `scripts\audit-responsive.mjs`:107 | jscpd: 20 lines, 122 tokens |
| warning | medium | tool.jscpd | scripts/_probe-phase5.mjs:46 | Copy-paste clone with `scripts\shots.mjs`:183 | jscpd: 17 lines, 104 tokens |
| warning | medium | clone.function | scripts/_probe-phase5.mjs:51 | Function `stableFill` shares 22 normalized block(s) with `stableFill` in scripts/_probe-tablet.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/_probe-phase5.mjs:51 | Function `stableFill` shares 22 normalized block(s) with `stableFill` in scripts/_probe.mjs | function-level Type-2 shingles |
| warning | medium | tool.jscpd | scripts/_probe-phase5.mjs:88 | Copy-paste clone with `scripts\_probe-zebra.mjs`:56 | jscpd: 8 lines, 55 tokens |
| warning | medium | tool.jscpd | scripts/_probe-phase5.mjs:91 | Copy-paste clone with `scripts\_probe.mjs`:72 | jscpd: 7 lines, 50 tokens |
| warning | high | structure.complexity | scripts/_probe-phase5.mjs:97 | Function `measureEntry` cyclomatic complexity 11 exceeds 10 | cyclomatic=11 · cognitive=11 · loc=30 |
| warning | medium | tool.jscpd | scripts/_probe-phase5.mjs:142 | Copy-paste clone with `scripts\_probe.mjs`:121 | jscpd: 39 lines, 247 tokens |
| warning | medium | tool.jscpd | scripts/_probe-phase5.mjs:143 | Copy-paste clone with `scripts\_probe-tablet.mjs`:115 | jscpd: 21 lines, 140 tokens |
| warning | medium | clone.function | scripts/_probe-phase5.mjs:146 | Function `main` shares 181 normalized block(s) with `main` in scripts/_probe-tablet.mjs | function-level Type-2 shingles |
| warning | high | structure.complexity | scripts/_probe-phase5.mjs:146 | Function `main` cyclomatic complexity 33 exceeds 10 | cyclomatic=33 · cognitive=35 · loc=202 |
| warning | medium | clone.function | scripts/_probe-phase5.mjs:146 | Function `main` shares 221 normalized block(s) with `main` in scripts/_probe.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/_probe-phase5.mjs:146 | Function `main` shares 265 normalized block(s) with `main` in scripts/_probe-zebra.mjs | function-level Type-2 shingles |
| warning | medium | tool.jscpd | scripts/_probe-phase5.mjs:149 | Copy-paste clone with `scripts\audit-responsive.mjs`:276 | jscpd: 32 lines, 194 tokens |
| warning | medium | tool.jscpd | scripts/_probe-phase5.mjs:171 | Copy-paste clone with `scripts\_probe-zebra.mjs`:174 | jscpd: 18 lines, 161 tokens |
| warning | medium | tool.jscpd | scripts/_probe-phase5.mjs:339 | Copy-paste clone with `scripts\_probe-tablet.mjs`:202 | jscpd: 15 lines, 109 tokens |
| warning | medium | tool.jscpd | scripts/_probe-phase5.mjs:339 | Copy-paste clone with `scripts\_probe-zebra.mjs`:298 | jscpd: 15 lines, 116 tokens |
| warning | medium | tool.jscpd | scripts/_probe-phase5.mjs:341 | Copy-paste clone with `scripts\_probe.mjs`:294 | jscpd: 13 lines, 102 tokens |
| warning | medium | clone.type2 | scripts/_probe-tablet.mjs:1 | Type-2 (renamed) clone: scripts/_probe-tablet.mjs shares 309 normalized token block(s) with scripts/_probe.mjs | Type-2 (renamed) clone: 40 tokens, 309 shared blocks |
| warning | medium | clone.copy-paste | scripts/_probe-tablet.mjs:1 | Type-1 copy-paste: scripts/_probe-tablet.mjs shares 344 normalized token block(s) with scripts/_probe.mjs | Type-1 copy-paste: 40 tokens, 344 shared blocks |
| warning | medium | tool.knip | scripts/_probe-tablet.mjs:1 | Knip: unused file `scripts/_probe-tablet.mjs` | knip category: files |
| warning | medium | clone.function | scripts/_probe-tablet.mjs:25 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/_probe-zebra.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/_probe-tablet.mjs:25 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/_probe.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/_probe-tablet.mjs:36 | Function `waitFor` shares 25 normalized block(s) with `waitFor` in scripts/_probe-zebra.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/_probe-tablet.mjs:36 | Function `waitFor` shares 25 normalized block(s) with `waitFor` in scripts/_probe.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/_probe-tablet.mjs:47 | Function `stableFill` shares 22 normalized block(s) with `stableFill` in scripts/_probe.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/_probe-tablet.mjs:65 | Function `measure` shares 13 normalized block(s) with `measureChrome` in scripts/_probe.mjs | function-level Type-2 shingles |
| warning | high | structure.complexity | scripts/_probe-tablet.mjs:65 | Function `measure` cyclomatic complexity 12 exceeds 10 | cyclomatic=12 · cognitive=13 · loc=44 |
| warning | medium | tool.jscpd | scripts/_probe-tablet.mjs:115 | Copy-paste clone with `scripts\_probe-zebra.mjs`:151 | jscpd: 33 lines, 245 tokens |
| warning | medium | clone.function | scripts/_probe-tablet.mjs:118 | Function `main` shares 239 normalized block(s) with `main` in scripts/_probe.mjs | function-level Type-2 shingles |
| warning | high | structure.complexity | scripts/_probe-tablet.mjs:118 | Function `main` cyclomatic complexity 11 exceeds 10 | cyclomatic=11 · cognitive=14 · loc=93 |
| warning | medium | clone.function | scripts/_probe-tablet.mjs:118 | Function `main` shares 220 normalized block(s) with `main` in scripts/_probe-zebra.mjs | function-level Type-2 shingles |
| warning | medium | tool.jscpd | scripts/_probe-tablet.mjs:145 | Copy-paste clone with `scripts\audit-responsive.mjs`:306 | jscpd: 7 lines, 59 tokens |
| warning | medium | tool.jscpd | scripts/_probe-tablet.mjs:145 | Copy-paste clone with `scripts\_probe.mjs`:157 | jscpd: 7 lines, 62 tokens |
| warning | medium | tool.jscpd | scripts/_probe-tablet.mjs:151 | Copy-paste clone with `scripts\_probe.mjs`:163 | jscpd: 6 lines, 54 tokens |
| warning | medium | tool.knip | scripts/_probe-zebra.mjs:1 | Knip: unused file `scripts/_probe-zebra.mjs` | knip category: files |
| warning | medium | clone.function | scripts/_probe-zebra.mjs:29 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/_probe.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/_probe-zebra.mjs:40 | Function `waitFor` shares 25 normalized block(s) with `waitFor` in scripts/_probe.mjs | function-level Type-2 shingles |
| warning | medium | tool.jscpd | scripts/_probe-zebra.mjs:56 | Copy-paste clone with `scripts\_probe.mjs`:69 | jscpd: 8 lines, 56 tokens |
| warning | medium | clone.function | scripts/_probe-zebra.mjs:154 | Function `main` shares 181 normalized block(s) with `main` in scripts/_probe.mjs | function-level Type-2 shingles |
| warning | high | structure.complexity | scripts/_probe-zebra.mjs:154 | Function `main` cyclomatic complexity 13 exceeds 10 | cyclomatic=13 · cognitive=15 · loc=153 |
| warning | medium | tool.knip | scripts/_probe.mjs:1 | Knip: unused file `scripts/_probe.mjs` | knip category: files |
| warning | high | structure.complexity | scripts/_probe.mjs:125 | Function `main` cyclomatic complexity 32 exceeds 10 | cyclomatic=32 · cognitive=34 · loc=176 |
| warning | medium | tool.knip | scripts/audit-responsive.mjs:1 | Knip: unused file `scripts/audit-responsive.mjs` | knip category: files |
| warning | high | structure.complexity | scripts/audit-responsive.mjs:64 | Function `parseArgs` cyclomatic complexity 12 exceeds 10 | cyclomatic=12 · cognitive=13 · loc=27 |
| warning | medium | clone.function | scripts/audit-responsive.mjs:64 | Function `parseArgs` shares 12 normalized block(s) with `selectedPages` in scripts/shots.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/audit-responsive.mjs:64 | Function `parseArgs` shares 37 normalized block(s) with `parseArgs` in scripts/shots.mjs | function-level Type-2 shingles |
| warning | medium | tool.jscpd | scripts/audit-responsive.mjs:90 | Copy-paste clone with `scripts\shots.mjs`:160 | jscpd: 22 lines, 123 tokens |
| warning | medium | clone.function | scripts/audit-responsive.mjs:93 | Function `portBusy` shares 7 normalized block(s) with `portBusy` in scripts/load-test.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/audit-responsive.mjs:93 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/_probe.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/audit-responsive.mjs:93 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/_probe-zebra.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/audit-responsive.mjs:93 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/_probe-tablet.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/audit-responsive.mjs:93 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/_auth-baseline.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/audit-responsive.mjs:93 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/shots.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/audit-responsive.mjs:93 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/_probe-phase5.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/audit-responsive.mjs:104 | Function `waitFor` shares 7 normalized block(s) with `waitFor` in scripts/shots.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/audit-responsive.mjs:104 | Function `waitFor` shares 32 normalized block(s) with `waitFor` in scripts/_auth-baseline.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/audit-responsive.mjs:118 | Function `stableFill` shares 9 normalized block(s) with `stableFill` in scripts/_probe.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/audit-responsive.mjs:118 | Function `stableFill` shares 9 normalized block(s) with `stableFill` in scripts/_probe-tablet.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/audit-responsive.mjs:118 | Function `stableFill` shares 29 normalized block(s) with `stableFill` in scripts/shots.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/audit-responsive.mjs:118 | Function `stableFill` shares 9 normalized block(s) with `stableFill` in scripts/_probe-phase5.mjs | function-level Type-2 shingles |
| warning | medium | tool.jscpd | scripts/audit-responsive.mjs:120 | Copy-paste clone with `scripts\shots.mjs`:195 | jscpd: 30 lines, 178 tokens |
| warning | medium | clone.function | scripts/audit-responsive.mjs:131 | Function `login` shares 97 normalized block(s) with `login` in scripts/shots.mjs | function-level Type-2 shingles |
| warning | high | structure.complexity | scripts/audit-responsive.mjs:159 | Function `auditInPage` cyclomatic complexity 27 exceeds 10 | cyclomatic=27 · cognitive=28 · loc=62 |
| warning | medium | clone.function | scripts/audit-responsive.mjs:223 | Function `settle` shares 47 normalized block(s) with `awaitReady` in scripts/shots.mjs | function-level Type-2 shingles |
| warning | medium | tool.jscpd | scripts/audit-responsive.mjs:247 | Copy-paste clone with `scripts\shots.mjs`:264 | jscpd: 14 lines, 81 tokens |
| warning | medium | clone.function | scripts/audit-responsive.mjs:265 | Function `main` shares 160 normalized block(s) with `main` in scripts/_probe-phase5.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/audit-responsive.mjs:265 | Function `main` shares 158 normalized block(s) with `main` in scripts/_probe-tablet.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/audit-responsive.mjs:265 | Function `main` shares 120 normalized block(s) with `main` in scripts/_probe-zebra.mjs | function-level Type-2 shingles |
| warning | high | structure.complexity | scripts/audit-responsive.mjs:265 | Function `main` cyclomatic complexity 17 exceeds 10 | cyclomatic=17 · cognitive=21 · loc=100 |
| warning | medium | clone.function | scripts/audit-responsive.mjs:265 | Function `main` shares 167 normalized block(s) with `main` in scripts/_auth-baseline.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/audit-responsive.mjs:265 | Function `main` shares 198 normalized block(s) with `main` in scripts/_probe.mjs | function-level Type-2 shingles |
| warning | medium | tool.knip | scripts/load-test.mjs:1 | Knip: unused binary `php` | knip category: binaries |
| warning | high | structure.complexity | scripts/load-test.mjs:62 | Function `markdownReport` cyclomatic complexity 23 exceeds 10 | cyclomatic=23 · cognitive=24 · loc=122 |
| warning | medium | clone.function | scripts/load-test.mjs:186 | Function `portBusy` shares 7 normalized block(s) with `portBusy` in scripts/_auth-baseline.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/load-test.mjs:186 | Function `portBusy` shares 7 normalized block(s) with `portBusy` in scripts/_probe-zebra.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/load-test.mjs:186 | Function `portBusy` shares 7 normalized block(s) with `portBusy` in scripts/_probe-phase5.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/load-test.mjs:186 | Function `portBusy` shares 7 normalized block(s) with `portBusy` in scripts/shots.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/load-test.mjs:186 | Function `portBusy` shares 7 normalized block(s) with `portBusy` in scripts/_probe.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/load-test.mjs:186 | Function `portBusy` shares 7 normalized block(s) with `portBusy` in scripts/_probe-tablet.mjs | function-level Type-2 shingles |
| warning | high | structure.complexity | scripts/load-test.mjs:197 | Function `main` cyclomatic complexity 106 exceeds 10 | cyclomatic=106 · cognitive=111 · loc=687 |
| critical | medium | security.hardcoded-secret | scripts/load-test.mjs:555 | Potential hardcoded secret (generic secret literal) — verify and remove from source | secret value intentionally redacted |
| critical | medium | security.hardcoded-secret | scripts/load-test.mjs:819 | Potential hardcoded secret (generic secret literal) — verify and remove from source | secret value intentionally redacted |
| warning | medium | tool.knip | scripts/shots.mjs:1 | Knip: unused binary `php` | knip category: binaries |
| warning | high | structure.complexity | scripts/shots.mjs:106 | Function `parseArgs` cyclomatic complexity 23 exceeds 10 | cyclomatic=23 · cognitive=23 · loc=37 |
| info | medium | git.churn-hotspot | scripts/shots.mjs:106 | Function hotspot `parseArgs`: 8 changes, cyclomatic 23, cognitive 23, 37 LOC (score 184) | git churn × function complexity |
| warning | medium | clone.function | scripts/shots.mjs:163 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/_probe-tablet.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/shots.mjs:163 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/_probe-zebra.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/shots.mjs:163 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/_probe.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/shots.mjs:163 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/_auth-baseline.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/shots.mjs:163 | Function `portBusy` shares 27 normalized block(s) with `portBusy` in scripts/_probe-phase5.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/shots.mjs:174 | Function `waitFor` shares 7 normalized block(s) with `waitFor` in scripts/_auth-baseline.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/shots.mjs:193 | Function `stableFill` shares 9 normalized block(s) with `stableFill` in scripts/_probe-phase5.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/shots.mjs:193 | Function `stableFill` shares 9 normalized block(s) with `stableFill` in scripts/_probe-tablet.mjs | function-level Type-2 shingles |
| warning | medium | clone.function | scripts/shots.mjs:193 | Function `stableFill` shares 9 normalized block(s) with `stableFill` in scripts/_probe.mjs | function-level Type-2 shingles |
| info | medium | git.churn-hotspot | scripts/shots.mjs:239 | Function hotspot `awaitReady`: 8 changes, cyclomatic 72, cognitive 79, 353 LOC (score 576) | git churn × function complexity |
| warning | high | structure.complexity | scripts/shots.mjs:239 | Function `awaitReady` cyclomatic complexity 72 exceeds 10 | cyclomatic=72 · cognitive=79 · loc=353 |
| info | medium | git.churn-hotspot | src/app/app.routes.ts:1 | Churn hotspot: 17 changes across 111 LOC (score 116) | git churn × function complexity |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:5 | Route `login` points at a lazy target that does not resolve | ./features/auth/login.page |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:9 | Route `register` points at a lazy target that does not resolve | ./features/auth/register.page |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:13 | Route `` points at a lazy target that does not resolve | ./core/layout/shell.component |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:19 | Route `` points at a lazy target that does not resolve | ./features/dashboard/dashboard.routes |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:24 | Route `entry` points at a lazy target that does not resolve | ./features/entry/entry.routes |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:28 | Route `students` points at a lazy target that does not resolve | ./features/students/students.routes |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:33 | Route `groups` points at a lazy target that does not resolve | ./features/groups/groups.routes |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:37 | Route `planning` points at a lazy target that does not resolve | ./features/planning/planning.routes |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:42 | Route `scoring` points at a lazy target that does not resolve | ./features/scoring/scoring.routes |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:47 | Route `exams` points at a lazy target that does not resolve | ./features/exams/exams.routes |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:51 | Route `reviews` points at a lazy target that does not resolve | ./features/reviews/reviews.routes |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:56 | Route `results` points at a lazy target that does not resolve | ./features/results/results.routes |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:61 | Route `reports` points at a lazy target that does not resolve | ./features/reports/reports.routes |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:66 | Route `news` points at a lazy target that does not resolve | ./features/news/news.routes |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:70 | Route `delegate` points at a lazy target that does not resolve | ./features/delegate/delegate.routes |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:75 | Route `notifications` points at a lazy target that does not resolve | ./features/notifications/notifications.routes |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:82 | Route `registrations` points at a lazy target that does not resolve | ./features/registrations/registrations.routes |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:89 | Route `users` points at a lazy target that does not resolve | ./features/users/users.routes |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:93 | Route `centers` points at a lazy target that does not resolve | ./features/centers/centers.routes |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:98 | Route `levels` points at a lazy target that does not resolve | ./features/levels/levels.routes |
| warning | medium | angular.dead-routes | src/app/app.routes.ts:102 | Route `settings` points at a lazy target that does not resolve | ./features/settings/settings.routes |
| warning | medium | tool.jscpd | src/app/core/api/api-client.spec.ts:68 | Copy-paste clone with `src\app\core\api\api-client.spec.ts`:88 | jscpd: 6 lines, 53 tokens |
| warning | medium | tool.jscpd | src/app/core/api/api-client.spec.ts:87 | Copy-paste clone with `src\app\core\api\api-client.spec.ts`:98 | jscpd: 8 lines, 92 tokens |
| warning | medium | tool.jscpd | src/app/core/api/api-client.spec.ts:88 | Copy-paste clone with `src\app\core\api\api-client.spec.ts`:109 | jscpd: 7 lines, 54 tokens |
| warning | medium | tool.jscpd | src/app/core/api/api-client.spec.ts:88 | Copy-paste clone with `src\app\core\api\api-client.spec.ts`:119 | jscpd: 7 lines, 54 tokens |
| warning | medium | tool.jscpd | src/app/core/api/api-client.ts:74 | Copy-paste clone with `src\app\core\api\api-client.ts`:82 | jscpd: 6 lines, 61 tokens |
| warning | medium | tool.knip | src/app/core/api/api-errors.ts:9 | Knip: unused export `API_ERROR_CODES` | knip category: exports |
| warning | medium | dead.unused-exports | src/app/core/api/api-errors.ts:9 | Exported binding `API_ERROR_CODES` is not imported by any analyzed module | no static consumer resolved · dynamic/template/public API usage is not excluded |
| info | medium | git.churn-hotspot | src/app/core/api/api-errors.ts:52 | Function hotspot `apiErrorKey`: 9 changes, cyclomatic 16, cognitive 18, 21 LOC (score 144) | git churn × function complexity |
| warning | high | structure.complexity | src/app/core/api/api-errors.ts:52 | Function `apiErrorKey` cyclomatic complexity 16 exceeds 10 | cyclomatic=16 · cognitive=18 · loc=21 |
| warning | medium | tool.jscpd | src/app/core/api/groups.service.ts:26 | Copy-paste clone with `src\app\core\api\users.service.ts`:27 | jscpd: 10 lines, 76 tokens |
| warning | medium | tool.jscpd | src/app/core/api/groups.service.ts:26 | Copy-paste clone with `src\app\core\api\students.service.ts`:26 | jscpd: 10 lines, 76 tokens |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsUpdateError` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceUploadError` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AttendanceBulkError` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AttendanceRateRow` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceUploadResponses` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceUpdateResponse` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceUpdateErrors` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AttendanceShowErrors` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceDestroyErrors` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceShowErrors` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsShowErrors` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsIndexError` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsUpdateData` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceDestroyError` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsDestroyData` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsStoreErrors` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AttendanceShowError` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AttendanceShowData` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceShowError` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceFileData` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsShowResponse` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AttendanceIndexErrors` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceDestroyData` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AttendanceIndexError` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsUpdateResponses` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceUpdateError` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AttendanceBulkResponses` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceFileResponse` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceUpdateData` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsStoreResponses` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsIndexData` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AttendanceBulkData` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AttendanceShowResponse` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceDestroyResponse` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AttendanceDestroyErrors` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsShowData` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementResource` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AcceptRegistrationRequest` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AttendanceShowResponses` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AttendanceDestroyResponses` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsIndexErrors` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceFileResponses` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsDestroyErrors` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceUploadResponse` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AttendanceDestroyData` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AuthLoginData` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceShowData` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AttendanceIndexResponses` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsDestroyError` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceShowResponse` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceUploadErrors` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceShowResponses` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsStoreError` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceFileErrors` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsDestroyResponses` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsIndexResponses` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceUpdateResponses` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AttendanceBulkErrors` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsShowResponses` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsUpdateErrors` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceDestroyResponses` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceResource` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AttendanceDestroyError` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsStoreData` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AnnouncementsShowError` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AttendanceIndexData` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceFileError` | knip category: types |
| warning | medium | tool.knip | src/app/core/api/models/index.ts:3 | Knip: unused type `AppearanceUploadData` | knip category: types |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:50 | Copy-paste clone with `src\app\core\settings\appearance.service.ts`:43 | jscpd: 16 lines, 65 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:618 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:708 | jscpd: 14 lines, 80 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1219 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:1235 | jscpd: 9 lines, 52 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1379 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:5434 | jscpd: 26 lines, 98 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1379 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:2783 | jscpd: 26 lines, 98 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1379 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:2633 | jscpd: 26 lines, 98 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1379 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:4638 | jscpd: 26 lines, 98 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1379 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:7280 | jscpd: 26 lines, 98 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1379 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:8815 | jscpd: 26 lines, 98 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1379 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:1949 | jscpd: 26 lines, 98 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1379 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:7784 | jscpd: 26 lines, 98 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1379 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:6479 | jscpd: 26 lines, 98 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1379 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:2845 | jscpd: 26 lines, 98 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1379 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:6031 | jscpd: 26 lines, 98 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1379 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:6656 | jscpd: 26 lines, 98 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1379 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:2497 | jscpd: 26 lines, 98 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1379 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:5662 | jscpd: 26 lines, 98 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1379 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:8206 | jscpd: 26 lines, 98 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1379 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:3799 | jscpd: 26 lines, 98 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1379 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:6362 | jscpd: 26 lines, 98 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1379 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:8508 | jscpd: 26 lines, 98 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1379 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:5209 | jscpd: 26 lines, 98 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1585 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:2405 | jscpd: 46 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1585 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:2672 | jscpd: 46 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1585 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:7990 | jscpd: 46 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1585 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:8408 | jscpd: 46 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1585 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:5864 | jscpd: 46 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1585 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:4005 | jscpd: 46 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1585 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:4320 | jscpd: 46 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1585 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:4832 | jscpd: 46 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1585 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:4143 | jscpd: 46 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1585 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:2536 | jscpd: 46 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1585 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:3459 | jscpd: 46 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1585 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:4074 | jscpd: 46 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1585 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:5117 | jscpd: 46 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1585 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:8723 | jscpd: 46 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1585 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:3035 | jscpd: 46 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1585 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:7489 | jscpd: 46 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1585 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:7134 | jscpd: 46 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:1585 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:6070 | jscpd: 46 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:2113 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:2232 | jscpd: 21 lines, 83 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:4421 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:4559 | jscpd: 16 lines, 60 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:4437 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:4527 | jscpd: 34 lines, 150 tokens |
| warning | medium | tool.jscpd | src/app/core/api/models/types.gen.ts:7709 | Copy-paste clone with `src\app\core\api\models\types.gen.ts`:7720 | jscpd: 11 lines, 50 tokens |
| warning | medium | tool.jscpd | src/app/core/api/students.service.ts:29 | Copy-paste clone with `src\app\core\api\users.service.ts`:30 | jscpd: 9 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/core/auth/auth.service.spec.ts:25 | Copy-paste clone with `src\app\core\settings\admin-prefs.service.spec.ts`:35 | jscpd: 15 lines, 73 tokens |
| warning | medium | tool.jscpd | src/app/core/auth/auth.service.spec.ts:27 | Copy-paste clone with `src\app\core\auth\role.guard.spec.ts`:49 | jscpd: 12 lines, 63 tokens |
| warning | medium | tool.jscpd | src/app/core/auth/auth.service.spec.ts:29 | Copy-paste clone with `src\app\core\settings\admin-prefs.service.spec.ts`:39 | jscpd: 12 lines, 58 tokens |
| warning | medium | subscriptions.teardown | src/app/core/auth/auth.service.ts:52 | Subscription in `AuthService` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/core/auth/auth.service.ts:107 | Subscription in `AuthService` has no detected teardown | no matching teardown found in this class |
| warning | medium | tool.jscpd | src/app/core/auth/role.guard.spec.ts:23 | Copy-paste clone with `src\app\core\auth\role.guard.spec.ts`:37 | jscpd: 8 lines, 63 tokens |
| warning | medium | tool.jscpd | src/app/core/auth/role.guard.spec.ts:48 | Copy-paste clone with `src\app\core\auth\role.guard.spec.ts`:139 | jscpd: 23 lines, 109 tokens |
| warning | medium | tool.jscpd | src/app/core/auth/role.guard.spec.ts:51 | Copy-paste clone with `src\app\core\auth\role.guard.spec.ts`:142 | jscpd: 21 lines, 90 tokens |
| warning | medium | tool.jscpd | src/app/core/auth/role.guard.spec.ts:103 | Copy-paste clone with `src\app\core\auth\role.guard.spec.ts`:124 | jscpd: 9 lines, 51 tokens |
| warning | medium | dead.unused-exports | src/app/core/guards/leave-controller.ts:17 | Exported binding `LeaveController` is not imported by any analyzed module | no static consumer resolved · dynamic/template/public API usage is not excluded |
| warning | high | structure.complexity | src/app/core/i18n/i18n-keys.spec.ts:17 | Function `duplicateKeys` cyclomatic complexity 19 exceeds 10 | cyclomatic=19 · cognitive=22 · loc=58 |
| info | medium | git.churn-hotspot | src/app/core/i18n/i18n-keys.spec.ts:17 | Function hotspot `duplicateKeys`: 7 changes, cyclomatic 19, cognitive 22, 58 LOC (score 133) | git churn × function complexity |
| warning | medium | subscriptions.teardown | src/app/core/i18n/language.service.ts:22 | Subscription in `LanguageService` has no detected teardown | no matching teardown found in this class |
| warning | medium | dead.unused-exports | src/app/core/layout/nav-items.ts:3 | Exported binding `NavItem` is not imported by any analyzed module | no static consumer resolved · dynamic/template/public API usage is not excluded |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/setup-guide/setup-guide.component.scss:55 | Class selector `guide-head` is declared more than once | first declared on line 29 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/setup-guide/setup-guide.component.scss:72 | Class selector `guide-sub` is declared more than once | first declared on line 62 |
| warning | medium | tool.jscpd | src/app/core/layout/setup-guide/setup-guide.component.scss:87 | Copy-paste clone with `src\app\features\exams\exam-detail.page.scss`:83 | jscpd: 6 lines, 53 tokens |
| warning | medium | tool.jscpd | src/app/core/layout/setup-guide/setup-guide.component.scss:158 | Copy-paste clone with `src\app\features\exams\exam-detail.page.scss`:211 | jscpd: 8 lines, 56 tokens |
| warning | medium | tool.jscpd | src/app/core/layout/setup-guide/setup-guide.component.scss:159 | Copy-paste clone with `src\app\styles\_exam-paper.scss`:30 | jscpd: 7 lines, 51 tokens |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/setup-guide/setup-guide.component.scss:312 | Class selector `guide-num` is declared more than once | first declared on line 184 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/setup-guide/setup-guide.component.scss:312 | Class selector `guide-step` is declared more than once | first declared on line 157 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/setup-guide/setup-guide.component.scss:318 | Class selector `guide-step.is-loading` is declared more than once | first declared on line 312 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/setup-guide/setup-guide.component.scss:318 | Class selector `guide-step` is declared more than once | first declared on line 312 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/setup-guide/setup-guide.component.scss:357 | Class selector `guide-panel` is declared more than once | first declared on line 13 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/setup-guide/setup-guide.component.scss:373 | Class selector `guide-panel` is declared more than once | first declared on line 357 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/setup-guide/setup-guide.component.scss:381 | Class selector `guide-scrim` is declared more than once | first declared on line 4 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/setup-guide/setup-guide.component.scss:382 | Class selector `guide-panel` is declared more than once | first declared on line 373 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/setup-guide/setup-guide.component.scss:383 | Class selector `guide-spark` is declared more than once | first declared on line 46 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/setup-guide/setup-guide.component.scss:384 | Class selector `guide-progress-fill` is declared more than once | first declared on line 125 |
| info | medium | git.churn-hotspot | src/app/core/layout/shell.component.html:1 | Churn hotspot: 24 changes across 363 LOC (score 204) | git churn × function complexity |
| warning | medium | tool.jscpd | src/app/core/layout/shell.component.html:202 | Copy-paste clone with `src\app\core\layout\shell.component.html`:308 | jscpd: 9 lines, 59 tokens |
| info | medium | git.churn-hotspot | src/app/core/layout/shell.component.scss:1 | Churn hotspot: 23 changes across 771 LOC (score 221) | git churn × function complexity |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:45 | Class selector `shell` is declared more than once | first declared on line 3 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:65 | Class selector `bg-pattern` is declared more than once | first declared on line 58 |
| warning | medium | styles.hardcoded-colors | src/app/core/layout/shell.component.scss:85 | Hardcoded color `#00b8a9` is used instead of a token | hex color literal |
| warning | medium | styles.hardcoded-colors | src/app/core/layout/shell.component.scss:97 | Hardcoded color `#8b5cf6` is used instead of a token | hex color literal |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:104 | Class selector `bg-orb` is declared more than once | first declared on line 69 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:104 | Class selector `shell` is declared more than once | first declared on line 45 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:104 | Class selector `shell.dark` is declared more than once | first declared on line 45 |
| warning | medium | styles.unused-selectors | src/app/core/layout/shell.component.scss:110 | Class selector `bg-default-pattern` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/core/layout/shell.component.scss:121 | Class selector `bg-custom` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/core/layout/shell.component.scss:126 | Class selector `bg-custom-scrim` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:132 | Class selector `shell` is declared more than once | first declared on line 104 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:132 | Class selector `bg-custom-scrim` is declared more than once | first declared on line 126 |
| warning | medium | styles.unused-selectors | src/app/core/layout/shell.component.scss:132 | Class selector `bg-custom-scrim` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:132 | Class selector `shell.dark` is declared more than once | first declared on line 104 |
| warning | medium | styles.unused-selectors | src/app/core/layout/shell.component.scss:138 | Class selector `bg-custom-pattern` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.hardcoded-colors | src/app/core/layout/shell.component.scss:191 | Hardcoded color `#fff` is used instead of a token | hex color literal |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:219 | Class selector `shell.dark` is declared more than once | first declared on line 132 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:219 | Class selector `brand-txt` is declared more than once | first declared on line 203 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:219 | Class selector `shell` is declared more than once | first declared on line 132 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:220 | Class selector `shell` is declared more than once | first declared on line 219 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:220 | Class selector `shell.dark` is declared more than once | first declared on line 219 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:221 | Class selector `shell.dark` is declared more than once | first declared on line 220 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:221 | Class selector `shell` is declared more than once | first declared on line 220 |
| warning | medium | styles.hardcoded-colors | src/app/core/layout/shell.component.scss:222 | Hardcoded color `#5eead4` is used instead of a token | hex color literal |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:225 | Class selector `brand-badge` is declared more than once | first declared on line 220 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:274 | Class selector `side-nav` is declared more than once | first declared on line 261 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:308 | Class selector `ico` is declared more than once | first declared on line 288 |
| warning | medium | styles.hardcoded-colors | src/app/core/layout/shell.component.scss:315 | Hardcoded color `#fff` is used instead of a token | hex color literal |
| warning | medium | styles.hardcoded-colors | src/app/core/layout/shell.component.scss:316 | Hardcoded color `#0e9f6e` is used instead of a token | hex color literal |
| warning | medium | styles.hardcoded-colors | src/app/core/layout/shell.component.scss:316 | Hardcoded color `#00b8a9` is used instead of a token | hex color literal |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:319 | Class selector `ico` is declared more than once | first declared on line 308 |
| warning | medium | styles.hardcoded-colors | src/app/core/layout/shell.component.scss:321 | Hardcoded color `#fff` is used instead of a token | hex color literal |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:326 | Class selector `shell` is declared more than once | first declared on line 221 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:326 | Class selector `side-nav` is declared more than once | first declared on line 274 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:327 | Class selector `shell.collapsed` is declared more than once | first declared on line 326 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:327 | Class selector `brand-txt` is declared more than once | first declared on line 219 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:327 | Class selector `shell` is declared more than once | first declared on line 326 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:328 | Class selector `shell` is declared more than once | first declared on line 327 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:328 | Class selector `brand-badge` is declared more than once | first declared on line 225 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:328 | Class selector `shell.collapsed` is declared more than once | first declared on line 327 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:329 | Class selector `shell` is declared more than once | first declared on line 328 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:329 | Class selector `nav-caption` is declared more than once | first declared on line 268 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:329 | Class selector `shell.collapsed` is declared more than once | first declared on line 328 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:330 | Class selector `shell.collapsed` is declared more than once | first declared on line 329 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:330 | Class selector `shell` is declared more than once | first declared on line 329 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:330 | Class selector `side-search` is declared more than once | first declared on line 234 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:334 | Class selector `shell` is declared more than once | first declared on line 330 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:334 | Class selector `shell.collapsed` is declared more than once | first declared on line 330 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:340 | Class selector `shell.collapsed` is declared more than once | first declared on line 334 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:340 | Class selector `side-foot` is declared more than once | first declared on line 334 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:340 | Class selector `foot-btn` is declared more than once | first declared on line 334 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:340 | Class selector `shell` is declared more than once | first declared on line 334 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:344 | Class selector `shell` is declared more than once | first declared on line 340 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:344 | Class selector `shell.collapsed` is declared more than once | first declared on line 340 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:344 | Class selector `sidebar` is declared more than once | first declared on line 146 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:349 | Class selector `shell` is declared more than once | first declared on line 344 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:349 | Class selector `shell.collapsed` is declared more than once | first declared on line 344 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:349 | Class selector `side-nav` is declared more than once | first declared on line 326 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:355 | Class selector `side-foot` is declared more than once | first declared on line 340 |
| warning | medium | styles.hardcoded-colors | src/app/core/layout/shell.component.scss:377 | Hardcoded color `#fff` is used instead of a token | hex color literal |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:383 | Class selector `foot-btn` is declared more than once | first declared on line 340 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:442 | Class selector `shell.collapsed` is declared more than once | first declared on line 349 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:442 | Class selector `shell` is declared more than once | first declared on line 349 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:442 | Class selector `main` is declared more than once | first declared on line 432 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:488 | Class selector `clock` is declared more than once | first declared on line 221 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:502 | Class selector `date-chip` is declared more than once | first declared on line 221 |
| warning | medium | styles.hardcoded-colors | src/app/core/layout/shell.component.scss:556 | Hardcoded color `#8b5cf6` is used instead of a token | hex color literal |
| warning | medium | styles.hardcoded-colors | src/app/core/layout/shell.component.scss:556 | Hardcoded color `#00b8a9` is used instead of a token | hex color literal |
| warning | medium | styles.hardcoded-colors | src/app/core/layout/shell.component.scss:557 | Hardcoded color `#fff` is used instead of a token | hex color literal |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:602 | Class selector `desk-btn` is declared more than once | first declared on line 593 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:618 | Class selector `topbar` is declared more than once | first declared on line 446 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:625 | Class selector `brand` is declared more than once | first declared on line 174 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:629 | Class selector `date-chip` is declared more than once | first declared on line 502 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:629 | Class selector `clock` is declared more than once | first declared on line 488 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:639 | Class selector `chip-short` is declared more than once | first declared on line 518 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:644 | Class selector `clock` is declared more than once | first declared on line 629 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:645 | Class selector `user-chip` is declared more than once | first declared on line 542 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:645 | Class selector `who` is declared more than once | first declared on line 563 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:646 | Class selector `icon-btn` is declared more than once | first declared on line 468 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:646 | Class selector `top-end` is declared more than once | first declared on line 462 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:654 | Class selector `sidebar` is declared more than once | first declared on line 344 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:665 | Class selector `sidebar` is declared more than once | first declared on line 654 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:669 | Class selector `sidebar` is declared more than once | first declared on line 665 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:676 | Class selector `sidebar` is declared more than once | first declared on line 669 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:676 | Class selector `shell.collapsed` is declared more than once | first declared on line 442 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:676 | Class selector `shell` is declared more than once | first declared on line 442 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:681 | Class selector `shell` is declared more than once | first declared on line 676 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:681 | Class selector `shell.collapsed` is declared more than once | first declared on line 676 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:681 | Class selector `side-nav` is declared more than once | first declared on line 349 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:687 | Class selector `lbl` is declared more than once | first declared on line 326 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:687 | Class selector `shell.collapsed` is declared more than once | first declared on line 681 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:687 | Class selector `side-nav` is declared more than once | first declared on line 681 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:687 | Class selector `shell` is declared more than once | first declared on line 681 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:688 | Class selector `shell` is declared more than once | first declared on line 687 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:688 | Class selector `shell.collapsed` is declared more than once | first declared on line 687 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:688 | Class selector `brand-txt` is declared more than once | first declared on line 327 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:689 | Class selector `shell` is declared more than once | first declared on line 688 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:689 | Class selector `shell.collapsed` is declared more than once | first declared on line 688 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:689 | Class selector `nav-caption` is declared more than once | first declared on line 329 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:690 | Class selector `shell` is declared more than once | first declared on line 689 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:690 | Class selector `brand-badge` is declared more than once | first declared on line 328 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:690 | Class selector `shell.collapsed` is declared more than once | first declared on line 689 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:694 | Class selector `shell.collapsed` is declared more than once | first declared on line 690 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:694 | Class selector `side-search` is declared more than once | first declared on line 330 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:694 | Class selector `shell` is declared more than once | first declared on line 690 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:698 | Class selector `side-foot` is declared more than once | first declared on line 355 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:698 | Class selector `shell.collapsed` is declared more than once | first declared on line 694 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:698 | Class selector `foot-btn` is declared more than once | first declared on line 383 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:698 | Class selector `shell` is declared more than once | first declared on line 694 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:704 | Class selector `shell.collapsed` is declared more than once | first declared on line 698 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:704 | Class selector `foot-btn` is declared more than once | first declared on line 698 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:704 | Class selector `side-foot` is declared more than once | first declared on line 698 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:704 | Class selector `shell` is declared more than once | first declared on line 698 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:708 | Class selector `main` is declared more than once | first declared on line 442 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:709 | Class selector `main` is declared more than once | first declared on line 708 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:709 | Class selector `shell.collapsed` is declared more than once | first declared on line 704 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:709 | Class selector `shell` is declared more than once | first declared on line 704 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:715 | Class selector `icon-btn` is declared more than once | first declared on line 646 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:715 | Class selector `top-end` is declared more than once | first declared on line 646 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:716 | Class selector `top-end` is declared more than once | first declared on line 715 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:721 | Class selector `drawer-lang` is declared more than once | first declared on line 608 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:730 | Class selector `top-end` is declared more than once | first declared on line 716 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:730 | Class selector `user-chip` is declared more than once | first declared on line 645 |
| warning | medium | styles.duplicate-selectors | src/app/core/layout/shell.component.scss:768 | Class selector `guide-dot` is declared more than once | first declared on line 745 |
| info | medium | git.churn-hotspot | src/app/core/layout/shell.component.ts:1 | Churn hotspot: 34 changes across 259 LOC (score 273) | git churn × function complexity |
| warning | medium | angular.unused-template-refs | src/app/core/layout/shell.component.ts:43 | #sidebarEl is never referenced in this template | template reference is declared but not read |
| warning | medium | angular.unused-template-refs | src/app/core/layout/shell.component.ts:43 | #menuBtn is never referenced in this template | template reference is declared but not read |
| warning | medium | assets.missing | src/app/core/layout/shell.component.ts:43 | Asset `assets/logo.png` does not exist relative to this file | static asset reference resolved on disk |
| warning | medium | tool.jscpd | src/app/core/layout/shell.component.ts:114 | Copy-paste clone with `src\app\core\layout\shell.component.ts`:132 | jscpd: 7 lines, 64 tokens |
| warning | high | subscriptions.teardown | src/app/core/layout/shell.component.ts:205 | Interval in `ShellComponent` has no detected teardown | teardown calls exist in this class but none match this resource |
| warning | medium | subscriptions.teardown | src/app/core/layout/shell.component.ts:208 | Subscription in `ShellComponent` has no detected teardown | teardown calls exist in this class but none match this resource |
| warning | medium | tool.jscpd | src/app/core/settings/admin-prefs.service.spec.ts:15 | Copy-paste clone with `src\app\features\planning\seasons-list.page.spec.ts`:15 | jscpd: 11 lines, 52 tokens |
| warning | medium | tool.jscpd | src/app/core/settings/appearance.service.spec.ts:8 | Copy-paste clone with `src\app\features\groups\group-form.page.spec.ts`:16 | jscpd: 14 lines, 57 tokens |
| warning | medium | tool.jscpd | src/app/core/settings/appearance.service.spec.ts:30 | Copy-paste clone with `src\app\features\settings\settings.page.spec.ts`:26 | jscpd: 31 lines, 139 tokens |
| warning | medium | dead.unused-exports | src/app/core/settings/appearance.service.ts:31 | Exported binding `AppearanceOptions` is not imported by any analyzed module | no static consumer resolved · dynamic/template/public API usage is not excluded |
| warning | medium | subscriptions.teardown | src/app/core/settings/appearance.service.ts:386 | Subscription in `AppearanceService` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/core/settings/appearance.service.ts:503 | Subscription in `AppearanceService` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/core/settings/setup-guide.service.ts:46 | Subscription in `SetupGuideService` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/core/settings/setup-guide.service.ts:72 | Subscription in `SetupGuideService` has no detected teardown | no matching teardown found in this class |
| warning | high | structure.explicit-any | src/app/core/storage/storage-secret.ts:5 | Explicit `any` weakens type safety | * authentication or XSS protection: anyone who can load the app can read the |
| critical | medium | security.hardcoded-secret | src/app/core/storage/storage-secret.ts:15 | Potential hardcoded secret (generic secret literal) — verify and remove from source | secret value intentionally redacted |
| warning | medium | dead.unused-exports | src/app/core/theme/theme.service.ts:4 | Exported binding `ThemeMode` is not imported by any analyzed module | no static consumer resolved · dynamic/template/public API usage is not excluded |
| warning | medium | subscriptions.teardown | src/app/features/auth/login.page.ts:53 | Subscription in `LoginPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | tool.jscpd | src/app/features/centers/centers-list.page.html:12 | Copy-paste clone with `src\app\features\levels\levels.page.html`:12 | jscpd: 18 lines, 60 tokens |
| warning | medium | tool.jscpd | src/app/features/centers/centers-list.page.html:113 | Copy-paste clone with `src\app\features\levels\levels.page.html`:217 | jscpd: 22 lines, 86 tokens |
| warning | medium | tool.jscpd | src/app/features/centers/centers-list.page.html:223 | Copy-paste clone with `src\app\features\news\news.page.html`:94 | jscpd: 16 lines, 65 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/centers/centers-list.page.scss:14 | Class selector `centers-table` is declared more than once | first declared on line 8 |
| warning | medium | tool.jscpd | src/app/features/centers/centers-list.page.scss:15 | Copy-paste clone with `src\app\shared\ui\list-table\list-table.component.scss`:47 | jscpd: 8 lines, 53 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/centers/centers-list.page.scss:15 | Class selector `centers-table` is declared more than once | first declared on line 14 |
| warning | medium | tool.jscpd | src/app/features/centers/centers-list.page.scss:15 | Copy-paste clone with `src\app\features\levels\levels.page.scss`:20 | jscpd: 8 lines, 53 tokens |
| warning | medium | tool.jscpd | src/app/features/centers/centers-list.page.scss:15 | Copy-paste clone with `src\app\features\students\students-list.page.scss`:20 | jscpd: 8 lines, 53 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/centers/centers-list.page.scss:22 | Class selector `centers-table` is declared more than once | first declared on line 15 |
| warning | medium | tool.jscpd | src/app/features/centers/centers-list.page.scss:22 | Copy-paste clone with `src\app\features\students\students-list.page.scss`:27 | jscpd: 11 lines, 83 tokens |
| warning | medium | tool.jscpd | src/app/features/centers/centers-list.page.scss:22 | Copy-paste clone with `src\app\features\levels\levels.page.scss`:27 | jscpd: 11 lines, 83 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/centers/centers-list.page.scss:32 | Class selector `centers-table` is declared more than once | first declared on line 22 |
| warning | medium | styles.duplicate-selectors | src/app/features/centers/centers-list.page.scss:37 | Class selector `centers-table` is declared more than once | first declared on line 32 |
| warning | medium | styles.duplicate-selectors | src/app/features/centers/centers-list.page.scss:42 | Class selector `centers-table` is declared more than once | first declared on line 37 |
| warning | medium | styles.duplicate-selectors | src/app/features/centers/centers-list.page.scss:46 | Class selector `centers-table` is declared more than once | first declared on line 42 |
| warning | medium | styles.duplicate-selectors | src/app/features/centers/centers-list.page.scss:47 | Class selector `centers-table` is declared more than once | first declared on line 46 |
| warning | medium | tool.jscpd | src/app/features/centers/centers-list.page.scss:53 | Copy-paste clone with `src\app\features\levels\levels.page.scss`:44 | jscpd: 9 lines, 67 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/centers/centers-list.page.scss:53 | Class selector `centers-table` is declared more than once | first declared on line 47 |
| warning | medium | tool.jscpd | src/app/features/centers/centers-list.page.scss:59 | Copy-paste clone with `src\app\features\levels\levels.page.scss`:140 | jscpd: 19 lines, 104 tokens |
| warning | medium | tool.jscpd | src/app/features/centers/centers-list.page.scss:61 | Copy-paste clone with `src\app\features\users\users-list.page.scss`:148 | jscpd: 13 lines, 81 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/centers/centers-list.page.scss:80 | Class selector `btn-sm` is declared more than once | first declared on line 57 |
| warning | medium | subscriptions.teardown | src/app/features/centers/centers-list.page.ts:97 | Subscription in `CentersListPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | tool.jscpd | src/app/features/centers/centers-list.page.ts:98 | Copy-paste clone with `src\app\features\centers\centers-list.page.ts`:155 | jscpd: 10 lines, 69 tokens |
| warning | medium | subscriptions.teardown | src/app/features/centers/centers-list.page.ts:154 | Subscription in `CentersListPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | tool.jscpd | src/app/features/centers/centers-list.page.ts:161 | Copy-paste clone with `src\app\features\news\news.page.ts`:97 | jscpd: 13 lines, 77 tokens |
| warning | medium | clone.type2 | src/app/features/centers/centers.routes.ts:1 | Type-2 (renamed) clone: src/app/features/centers/centers.routes.ts shares 36 normalized token block(s) with src/app/features/reviews/reviews.routes.ts | Type-2 (renamed) clone: 40 tokens, 36 shared blocks |
| warning | medium | clone.type2 | src/app/features/centers/centers.routes.ts:1 | Type-2 (renamed) clone: src/app/features/centers/centers.routes.ts shares 36 normalized token block(s) with src/app/features/notifications/notifications.routes.ts | Type-2 (renamed) clone: 40 tokens, 36 shared blocks |
| warning | medium | clone.type2 | src/app/features/centers/centers.routes.ts:1 | Type-2 (renamed) clone: src/app/features/centers/centers.routes.ts shares 43 normalized token block(s) with src/app/features/levels/levels.routes.ts | Type-2 (renamed) clone: 40 tokens, 43 shared blocks |
| warning | medium | clone.type2 | src/app/features/centers/centers.routes.ts:1 | Type-2 (renamed) clone: src/app/features/centers/centers.routes.ts shares 36 normalized token block(s) with src/app/features/news/news.routes.ts | Type-2 (renamed) clone: 40 tokens, 36 shared blocks |
| warning | medium | clone.type2 | src/app/features/centers/centers.routes.ts:1 | Type-2 (renamed) clone: src/app/features/centers/centers.routes.ts shares 43 normalized token block(s) with src/app/features/scoring/scoring.routes.ts | Type-2 (renamed) clone: 40 tokens, 43 shared blocks |
| warning | medium | angular.dead-routes | src/app/features/centers/centers.routes.ts:6 | Route `` points at a lazy target that does not resolve | ./centers-list.page |
| info | medium | git.churn-hotspot | src/app/features/dashboard/dashboard.page.html:1 | Churn hotspot: 14 changes across 228 LOC (score 110) | git churn × function complexity |
| warning | medium | tool.jscpd | src/app/features/dashboard/dashboard.page.html:167 | Copy-paste clone with `src\app\features\students\students-list.page.html`:113 | jscpd: 8 lines, 61 tokens |
| warning | medium | tool.jscpd | src/app/features/dashboard/dashboard.page.html:167 | Copy-paste clone with `src\app\features\groups\group-detail.page.html`:247 | jscpd: 8 lines, 64 tokens |
| warning | medium | tool.jscpd | src/app/features/dashboard/dashboard.page.scss:32 | Copy-paste clone with `src\app\features\groups\group-detail.page.scss`:438 | jscpd: 6 lines, 54 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:71 | Class selector `f-search` is declared more than once | first declared on line 64 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:85 | Class selector `f-search` is declared more than once | first declared on line 71 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:121 | Class selector `filters` is declared more than once | first declared on line 57 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:125 | Class selector `f-field` is declared more than once | first declared on line 111 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:148 | Class selector `filters` is declared more than once | first declared on line 121 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:149 | Class selector `filters.no-center` is declared more than once | first declared on line 121 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:149 | Class selector `filters` is declared more than once | first declared on line 148 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:155 | Class selector `filters` is declared more than once | first declared on line 149 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:159 | Class selector `filters.no-center` is declared more than once | first declared on line 149 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:159 | Class selector `filters` is declared more than once | first declared on line 155 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:163 | Class selector `f-center` is declared more than once | first declared on line 116 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:169 | Class selector `filters` is declared more than once | first declared on line 159 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:173 | Class selector `filters` is declared more than once | first declared on line 169 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:173 | Class selector `filters.no-center` is declared more than once | first declared on line 159 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:177 | Class selector `f-search` is declared more than once | first declared on line 85 |
| warning | medium | styles.hardcoded-colors | src/app/features/dashboard/dashboard.page.scss:216 | Hardcoded color `#00b8a9` is used instead of a token | hex color literal |
| warning | medium | styles.hardcoded-colors | src/app/features/dashboard/dashboard.page.scss:216 | Hardcoded color `#8b5cf6` is used instead of a token | hex color literal |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:299 | Class selector `kpis` is declared more than once | first declared on line 187 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:305 | Class selector `kpi` is declared more than once | first declared on line 194 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:310 | Class selector `kpi-ico` is declared more than once | first declared on line 228 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:317 | Class selector `ring` is declared more than once | first declared on line 276 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:322 | Class selector `ring-card` is declared more than once | first declared on line 271 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:328 | Class selector `kpis` is declared more than once | first declared on line 299 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:332 | Class selector `kpi` is declared more than once | first declared on line 305 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:336 | Class selector `kpi-ico` is declared more than once | first declared on line 310 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:344 | Class selector `kpis` is declared more than once | first declared on line 328 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:349 | Class selector `kpi` is declared more than once | first declared on line 332 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:353 | Class selector `kpi-ico` is declared more than once | first declared on line 336 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:360 | Class selector `ring` is declared more than once | first declared on line 317 |
| warning | medium | styles.hardcoded-colors | src/app/features/dashboard/dashboard.page.scss:480 | Hardcoded color `#fff` is used instead of a token | hex color literal |
| warning | medium | styles.hardcoded-colors | src/app/features/dashboard/dashboard.page.scss:482 | Hardcoded color `#8b5cf6` is used instead of a token | hex color literal |
| warning | medium | styles.hardcoded-colors | src/app/features/dashboard/dashboard.page.scss:482 | Hardcoded color `#00b8a9` is used instead of a token | hex color literal |
| warning | medium | tool.jscpd | src/app/features/dashboard/dashboard.page.scss:502 | Copy-paste clone with `src\app\features\groups\group-detail.page.scss`:359 | jscpd: 12 lines, 60 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:527 | Class selector `panel` is declared more than once | first declared on line 368 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:534 | Class selector `table-wrap` is declared more than once | first declared on line 373 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:616 | Class selector `stud-name` is declared more than once | first declared on line 466 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:622 | Class selector `pill` is declared more than once | first declared on line 497 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:646 | Class selector `chart-card` is declared more than once | first declared on line 635 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:654 | Class selector `charts` is declared more than once | first declared on line 629 |
| warning | medium | styles.duplicate-selectors | src/app/features/dashboard/dashboard.page.scss:660 | Class selector `charts` is declared more than once | first declared on line 654 |
| warning | high | dead.unused-private-members | src/app/features/dashboard/dashboard.page.ts:78 | TS6133: 'autoCenter' is declared but its value is never read. | tsc --noEmit: 'autoCenter' is declared but its value is never read. |
| warning | medium | tool.jscpd | src/app/features/dashboard/dashboard.page.ts:85 | Copy-paste clone with `src\app\features\students\students-list.page.ts`:49 | jscpd: 9 lines, 63 tokens |
| warning | medium | tool.jscpd | src/app/features/dashboard/dashboard.page.ts:85 | Copy-paste clone with `src\app\features\users\users-list.page.ts`:67 | jscpd: 9 lines, 63 tokens |
| warning | medium | tool.jscpd | src/app/features/dashboard/dashboard.page.ts:95 | Copy-paste clone with `src\app\features\students\students-list.page.ts`:59 | jscpd: 7 lines, 60 tokens |
| warning | medium | tool.jscpd | src/app/features/dashboard/dashboard.page.ts:137 | Copy-paste clone with `src\app\features\dashboard\dashboard.page.ts`:251 | jscpd: 17 lines, 84 tokens |
| warning | medium | clone.type2 | src/app/features/dashboard/dashboard.routes.ts:1 | Type-2 (renamed) clone: src/app/features/dashboard/dashboard.routes.ts shares 23 normalized token block(s) with src/app/features/registrations/registrations.routes.ts | Type-2 (renamed) clone: 40 tokens, 23 shared blocks |
| warning | medium | clone.type2 | src/app/features/dashboard/dashboard.routes.ts:1 | Type-2 (renamed) clone: src/app/features/dashboard/dashboard.routes.ts shares 23 normalized token block(s) with src/app/features/settings/settings.routes.ts | Type-2 (renamed) clone: 40 tokens, 23 shared blocks |
| warning | medium | clone.type2 | src/app/features/dashboard/dashboard.routes.ts:1 | Type-2 (renamed) clone: src/app/features/dashboard/dashboard.routes.ts shares 27 normalized token block(s) with src/app/features/entry/entry.routes.ts | Type-2 (renamed) clone: 40 tokens, 27 shared blocks |
| warning | medium | angular.dead-routes | src/app/features/dashboard/dashboard.routes.ts:5 | Route `` points at a lazy target that does not resolve | ./dashboard.page |
| warning | medium | tool.jscpd | src/app/features/delegate/delegate.page.ts:49 | Copy-paste clone with `src\app\features\news\news.page.ts`:110 | jscpd: 6 lines, 50 tokens |
| warning | medium | subscriptions.teardown | src/app/features/delegate/delegate.page.ts:80 | Subscription in `DelegatePage` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/features/delegate/delegate.page.ts:92 | Subscription in `DelegatePage` has no detected teardown | no matching teardown found in this class |
| warning | medium | clone.type2 | src/app/features/delegate/delegate.routes.ts:1 | Type-2 (renamed) clone: src/app/features/delegate/delegate.routes.ts shares 46 normalized token block(s) with src/app/features/notifications/notifications.routes.ts | Type-2 (renamed) clone: 40 tokens, 46 shared blocks |
| warning | medium | clone.type2 | src/app/features/delegate/delegate.routes.ts:1 | Type-2 (renamed) clone: src/app/features/delegate/delegate.routes.ts shares 46 normalized token block(s) with src/app/features/reviews/reviews.routes.ts | Type-2 (renamed) clone: 40 tokens, 46 shared blocks |
| warning | medium | angular.dead-routes | src/app/features/delegate/delegate.routes.ts:6 | Route `` points at a lazy target that does not resolve | ./delegate.page |
| warning | medium | angular.dead-routes | src/app/features/delegate/delegate.routes.ts:13 | Route `redeem` points at a lazy target that does not resolve | ./redeem.page |
| warning | medium | styles.unused-selectors | src/app/features/entry/components/entry-table.component.scss:19 | Class selector `dd` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:19 | Class selector `table-scroll` is declared more than once | first declared on line 8 |
| warning | medium | tool.jscpd | src/app/features/entry/components/entry-table.component.scss:37 | Copy-paste clone with `src\app\features\entry\components\entry-table.component.scss`:52 | jscpd: 6 lines, 62 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:49 | Class selector `etable` is declared more than once | first declared on line 23 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:49 | Class selector `erow` is declared more than once | first declared on line 33 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:60 | Class selector `erow` is declared more than once | first declared on line 49 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:66 | Class selector `erow.line` is declared more than once | first declared on line 60 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:66 | Class selector `erow` is declared more than once | first declared on line 60 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:71 | Class selector `erow` is declared more than once | first declared on line 66 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:71 | Class selector `erow.line` is declared more than once | first declared on line 66 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:71 | Class selector `erow.line.dirty` is declared more than once | first declared on line 66 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:77 | Class selector `dd` is declared more than once | first declared on line 19 |
| warning | medium | styles.unused-selectors | src/app/features/entry/components/entry-table.component.scss:77 | Class selector `dd` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:77 | Class selector `erow.line` is declared more than once | first declared on line 71 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:77 | Class selector `erow` is declared more than once | first declared on line 71 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:77 | Class selector `dd.open` is declared more than once | first declared on line 19 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:87 | Class selector `ecell` is declared more than once | first declared on line 71 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:91 | Class selector `ecell` is declared more than once | first declared on line 87 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:91 | Class selector `ecell.pupil` is declared more than once | first declared on line 71 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:109 | Class selector `ecell` is declared more than once | first declared on line 91 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:113 | Class selector `ecell` is declared more than once | first declared on line 109 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:123 | Class selector `ecell` is declared more than once | first declared on line 113 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:127 | Class selector `ecell` is declared more than once | first declared on line 123 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:143 | Class selector `etable` is declared more than once | first declared on line 49 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:147 | Class selector `erow` is declared more than once | first declared on line 77 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:151 | Class selector `erow` is declared more than once | first declared on line 147 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:151 | Class selector `etable` is declared more than once | first declared on line 143 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:152 | Class selector `etable.with-mem` is declared more than once | first declared on line 49 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:152 | Class selector `erow` is declared more than once | first declared on line 151 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:152 | Class selector `etable` is declared more than once | first declared on line 151 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:159 | Class selector `ecell` is declared more than once | first declared on line 127 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:170 | Class selector `ecell` is declared more than once | first declared on line 159 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:170 | Class selector `ecell.pupil` is declared more than once | first declared on line 91 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:181 | Class selector `ecell` is declared more than once | first declared on line 170 |
| warning | medium | tool.jscpd | src/app/features/entry/components/entry-table.component.scss:181 | Copy-paste clone with `src\app\shared\ui\list-table\list-table.component.scss`:227 | jscpd: 6 lines, 52 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:188 | Class selector `ecell.num` is declared more than once | first declared on line 109 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:188 | Class selector `ecell` is declared more than once | first declared on line 181 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:194 | Class selector `ecell.num` is declared more than once | first declared on line 188 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:194 | Class selector `ecell` is declared more than once | first declared on line 188 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:198 | Class selector `ecell.goal` is declared more than once | first declared on line 113 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:198 | Class selector `ecell` is declared more than once | first declared on line 194 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:198 | Class selector `input` is declared more than once | first declared on line 131 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:207 | Class selector `etable` is declared more than once | first declared on line 152 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:211 | Class selector `erow` is declared more than once | first declared on line 152 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:218 | Class selector `erow.ehead` is declared more than once | first declared on line 147 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:218 | Class selector `erow` is declared more than once | first declared on line 211 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:222 | Class selector `ecell` is declared more than once | first declared on line 198 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:232 | Class selector `erow.line` is declared more than once | first declared on line 77 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:232 | Class selector `erow` is declared more than once | first declared on line 218 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:232 | Class selector `ecell` is declared more than once | first declared on line 222 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:236 | Class selector `pupil` is declared more than once | first declared on line 181 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:236 | Class selector `ecell` is declared more than once | first declared on line 232 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:248 | Class selector `ecell` is declared more than once | first declared on line 236 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:248 | Class selector `pupil` is declared more than once | first declared on line 236 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:254 | Class selector `num` is declared more than once | first declared on line 248 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:254 | Class selector `ecell` is declared more than once | first declared on line 248 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:254 | Class selector `pupil` is declared more than once | first declared on line 248 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:260 | Class selector `ecell` is declared more than once | first declared on line 254 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:261 | Class selector `input.mem` is declared more than once | first declared on line 131 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:261 | Class selector `ecell` is declared more than once | first declared on line 260 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:261 | Class selector `input` is declared more than once | first declared on line 198 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:265 | Class selector `ecell.pupil` is declared more than once | first declared on line 170 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:265 | Class selector `ecell` is declared more than once | first declared on line 261 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:269 | Class selector `ecell.goal` is declared more than once | first declared on line 198 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:269 | Class selector `ecell` is declared more than once | first declared on line 265 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:273 | Class selector `ecell.goal` is declared more than once | first declared on line 269 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:273 | Class selector `ecell` is declared more than once | first declared on line 269 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:273 | Class selector `input` is declared more than once | first declared on line 261 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:282 | Class selector `input` is declared more than once | first declared on line 273 |
| warning | medium | tool.jscpd | src/app/features/entry/components/entry-table.component.scss:282 | Copy-paste clone with `src\app\features\exams\weekly-exam.page.scss`:28 | jscpd: 8 lines, 69 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/components/entry-table.component.scss:282 | Class selector `ecell` is declared more than once | first declared on line 273 |
| warning | medium | subscriptions.teardown | src/app/features/entry/components/entry-table.component.ts:560 | Subscription in `EntryTableComponent` has no detected teardown | no matching teardown found in this class |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.html:25 | Copy-paste clone with `src\app\features\settings\settings.page.html`:554 | jscpd: 7 lines, 82 tokens |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.html:31 | Copy-paste clone with `src\app\features\exams\exams-list.page.html`:76 | jscpd: 15 lines, 53 tokens |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.html:31 | Copy-paste clone with `src\app\features\exams\exams-list.page.html`:144 | jscpd: 17 lines, 56 tokens |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.html:34 | Copy-paste clone with `src\app\features\entry\entry.page.html`:56 | jscpd: 15 lines, 50 tokens |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.html:99 | Copy-paste clone with `src\app\features\entry\entry.page.html`:184 | jscpd: 6 lines, 60 tokens |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.html:99 | Copy-paste clone with `src\app\features\entry\entry.page.html`:283 | jscpd: 6 lines, 60 tokens |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.html:114 | Copy-paste clone with `src\app\features\exams\exams-list.page.html`:36 | jscpd: 7 lines, 50 tokens |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.html:130 | Copy-paste clone with `src\app\features\exams\exams-list.page.html`:47 | jscpd: 9 lines, 57 tokens |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.html:131 | Copy-paste clone with `src\app\features\exams\exams-list.page.html`:119 | jscpd: 9 lines, 55 tokens |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.html:218 | Copy-paste clone with `src\app\features\entry\entry.page.html`:294 | jscpd: 12 lines, 87 tokens |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.html:256 | Copy-paste clone with `src\app\features\entry\entry.page.html`:329 | jscpd: 17 lines, 78 tokens |
| warning | medium | styles.unused-selectors | src/app/features/entry/entry.page.scss:115 | Class selector `4vw` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/entry/entry.page.scss:141 | Class selector `55` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/entry/entry.page.scss:173 | Class selector `78` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/entry/entry.page.scss:193 | Class selector `5` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/entry/entry.page.scss:227 | Class selector `45` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:271 | Class selector `week-grid` is declared more than once | first declared on line 265 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:284 | Class selector `group-grid` is declared more than once | first declared on line 277 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:288 | Class selector `week-grid` is declared more than once | first declared on line 271 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:294 | Class selector `group-grid` is declared more than once | first declared on line 284 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:298 | Class selector `week-grid` is declared more than once | first declared on line 288 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:299 | Class selector `session-grid` is declared more than once | first declared on line 266 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:300 | Class selector `skeleton-grid` is declared more than once | first declared on line 267 |
| warning | medium | styles.unused-selectors | src/app/features/entry/entry.page.scss:365 | Class selector `992` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:396 | Class selector `choice-top` is declared more than once | first declared on line 386 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:397 | Class selector `choice-top` is declared more than once | first declared on line 396 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:442 | Class selector `2` is declared more than once | first declared on line 186 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:457 | Class selector `choice-go` is declared more than once | first declared on line 352 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:544 | Class selector `3` is declared more than once | first declared on line 451 |
| warning | medium | styles.unused-selectors | src/app/features/entry/entry.page.scss:607 | Class selector `35` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:679 | Class selector `crumb-chev` is declared more than once | first declared on line 101 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:680 | Class selector `choice-go` is declared more than once | first declared on line 457 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:684 | Class selector `choice` is declared more than once | first declared on line 309 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:684 | Class selector `choice-go` is declared more than once | first declared on line 680 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:692 | Class selector `trail` is declared more than once | first declared on line 14 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:699 | Class selector `crumb` is declared more than once | first declared on line 34 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:704 | Class selector `crumb-label` is declared more than once | first declared on line 83 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:708 | Class selector `picker` is declared more than once | first declared on line 110 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:712 | Class selector `choice-grid` is declared more than once | first declared on line 255 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:716 | Class selector `choice` is declared more than once | first declared on line 684 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:732 | Class selector `term-tab` is declared more than once | first declared on line 218 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:737 | Class selector `step-badge` is declared more than once | first declared on line 153 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:744 | Class selector `count-chip` is declared more than once | first declared on line 197 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:749 | Class selector `picker-head` is declared more than once | first declared on line 146 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:753 | Class selector `fill-stat` is declared more than once | first declared on line 503 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:757 | Class selector `choice-stats` is declared more than once | first declared on line 475 |
| warning | medium | styles.duplicate-selectors | src/app/features/entry/entry.page.scss:763 | Class selector `choice` is declared more than once | first declared on line 716 |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.spec.ts:1 | Copy-paste clone with `src\app\features\planning\seasons-list.page.spec.ts`:1 | jscpd: 13 lines, 65 tokens |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.spec.ts:1 | Copy-paste clone with `src\app\features\levels\levels.page.spec.ts`:1 | jscpd: 11 lines, 52 tokens |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.spec.ts:1 | Copy-paste clone with `src\app\features\users\users-list.page.spec.ts`:1 | jscpd: 11 lines, 52 tokens |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.spec.ts:179 | Copy-paste clone with `src\app\features\users\users-list.page.spec.ts`:78 | jscpd: 12 lines, 63 tokens |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.spec.ts:179 | Copy-paste clone with `src\app\features\groups\group-form.page.spec.ts`:142 | jscpd: 12 lines, 63 tokens |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.spec.ts:179 | Copy-paste clone with `src\app\features\planning\seasons-list.page.spec.ts`:111 | jscpd: 12 lines, 63 tokens |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.spec.ts:179 | Copy-paste clone with `src\app\features\planning\season-create.page.spec.ts`:64 | jscpd: 12 lines, 63 tokens |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.spec.ts:179 | Copy-paste clone with `src\app\features\levels\levels.page.spec.ts`:155 | jscpd: 12 lines, 63 tokens |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.spec.ts:204 | Copy-paste clone with `src\app\features\entry\entry.page.spec.ts`:279 | jscpd: 7 lines, 50 tokens |
| info | medium | git.churn-hotspot | src/app/features/entry/entry.page.ts:1 | Churn hotspot: 12 changes across 328 LOC (score 100) | git churn × function complexity |
| warning | medium | tool.jscpd | src/app/features/entry/entry.page.ts:127 | Copy-paste clone with `src\app\features\exams\exams-list.page.ts`:63 | jscpd: 6 lines, 68 tokens |
| warning | medium | clone.type2 | src/app/features/entry/entry.routes.ts:1 | Type-2 (renamed) clone: src/app/features/entry/entry.routes.ts shares 23 normalized token block(s) with src/app/features/settings/settings.routes.ts | Type-2 (renamed) clone: 40 tokens, 23 shared blocks |
| warning | medium | clone.type2 | src/app/features/entry/entry.routes.ts:1 | Type-2 (renamed) clone: src/app/features/entry/entry.routes.ts shares 23 normalized token block(s) with src/app/features/registrations/registrations.routes.ts | Type-2 (renamed) clone: 40 tokens, 23 shared blocks |
| warning | medium | angular.dead-routes | src/app/features/entry/entry.routes.ts:5 | Route `` points at a lazy target that does not resolve | ./entry.page |
| info | medium | git.churn-hotspot | src/app/features/exams/exam-detail.page.html:1 | Churn hotspot: 23 changes across 152 LOC (score 167) | git churn × function complexity |
| warning | medium | tool.jscpd | src/app/features/exams/exam-detail.page.scss:12 | Copy-paste clone with `src\app\features\exams\exams-list.page.scss`:281 | jscpd: 9 lines, 87 tokens |
| warning | medium | tool.jscpd | src/app/features/exams/exam-detail.page.scss:38 | Copy-paste clone with `src\app\features\exams\exams-list.page.scss`:308 | jscpd: 11 lines, 51 tokens |
| warning | medium | styles.hardcoded-colors | src/app/features/exams/exam-detail.page.scss:53 | Hardcoded color `#fff` is used instead of a token | hex color literal |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:116 | Class selector `score-track` is declared more than once | first declared on line 110 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:120 | Class selector `score-progress` is declared more than once | first declared on line 111 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:144 | Class selector `score-center` is declared more than once | first declared on line 134 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:169 | Class selector `score-ring` is declared more than once | first declared on line 93 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:169 | Class selector `score-progress` is declared more than once | first declared on line 120 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:173 | Class selector `score-progress` is declared more than once | first declared on line 169 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:173 | Class selector `score-ring` is declared more than once | first declared on line 169 |
| warning | medium | tool.jscpd | src/app/features/exams/exam-detail.page.scss:213 | Copy-paste clone with `src\app\styles\_exam-paper.scss`:31 | jscpd: 6 lines, 53 tokens |
| warning | medium | tool.jscpd | src/app/features/exams/exam-detail.page.scss:215 | Copy-paste clone with `src\app\features\exams\exams-list.page.scss`:608 | jscpd: 9 lines, 56 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:297 | Class selector `score-den` is declared more than once | first declared on line 157 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:304 | Class selector `q-score` is declared more than once | first declared on line 275 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:305 | Class selector `score-num` is declared more than once | first declared on line 284 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:309 | Class selector `score-bar` is declared more than once | first declared on line 290 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:315 | Class selector `q-score` is declared more than once | first declared on line 304 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:315 | Class selector `score-num` is declared more than once | first declared on line 305 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:320 | Class selector `result-hero` is declared more than once | first declared on line 9 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:324 | Class selector `hero-actions` is declared more than once | first declared on line 177 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:333 | Class selector `result-hero` is declared more than once | first declared on line 320 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:339 | Class selector `hero-identity` is declared more than once | first declared on line 38 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:343 | Class selector `score-ring` is declared more than once | first declared on line 173 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:349 | Class selector `score-main` is declared more than once | first declared on line 152 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:353 | Class selector `hero-actions` is declared more than once | first declared on line 324 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:358 | Class selector `question-card` is declared more than once | first declared on line 208 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:363 | Class selector `q-score` is declared more than once | first declared on line 315 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:370 | Class selector `question-card` is declared more than once | first declared on line 358 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exam-detail.page.scss:371 | Class selector `score-progress` is declared more than once | first declared on line 173 |
| warning | medium | subscriptions.teardown | src/app/features/exams/exam-detail.page.ts:70 | Subscription in `ExamDetailPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | tool.jscpd | src/app/features/exams/exams-list.page.html:46 | Copy-paste clone with `src\app\features\exams\exams-list.page.html`:116 | jscpd: 9 lines, 63 tokens |
| warning | medium | tool.jscpd | src/app/features/exams/exams-list.page.html:73 | Copy-paste clone with `src\app\features\exams\exams-list.page.html`:141 | jscpd: 16 lines, 92 tokens |
| warning | medium | tool.jscpd | src/app/features/exams/exams-list.page.html:76 | Copy-paste clone with `src\app\features\exams\exams-list.page.html`:157 | jscpd: 13 lines, 59 tokens |
| warning | medium | tool.jscpd | src/app/features/exams/exams-list.page.html:638 | Copy-paste clone with `src\app\features\exams\exams-list.page.html`:781 | jscpd: 16 lines, 56 tokens |
| warning | medium | tool.jscpd | src/app/features/exams/exams-list.page.html:656 | Copy-paste clone with `src\app\features\exams\exams-list.page.html`:799 | jscpd: 9 lines, 53 tokens |
| warning | medium | styles.hardcoded-colors | src/app/features/exams/exams-list.page.scss:43 | Hardcoded color `#fff` is used instead of a token | hex color literal |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:143 | Class selector `choice-avatar` is declared more than once | first declared on line 126 |
| warning | medium | styles.hardcoded-colors | src/app/features/exams/exams-list.page.scss:146 | Hardcoded color `#fff` is used instead of a token | hex color literal |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:192 | Class selector `choice` is declared more than once | first declared on line 86 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:272 | Class selector `choice-go` is declared more than once | first declared on line 175 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:273 | Class selector `crumb-chev` is declared more than once | first declared on line 264 |
| warning | medium | styles.hardcoded-colors | src/app/features/exams/exams-list.page.scss:323 | Hardcoded color `#fff` is used instead of a token | hex color literal |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:346 | Class selector `hero-copy` is declared more than once | first declared on line 329 |
| warning | medium | tool.jscpd | src/app/features/exams/exams-list.page.scss:373 | Copy-paste clone with `src\app\features\exams\exams-list.page.scss`:482 | jscpd: 6 lines, 57 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:383 | Class selector `mode-pill` is declared more than once | first declared on line 370 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:444 | Class selector `create-col` is declared more than once | first declared on line 437 |
| warning | medium | styles.hardcoded-colors | src/app/features/exams/exams-list.page.scss:523 | Hardcoded color `#fff` is used instead of a token | hex color literal |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:656 | Class selector `field` is declared more than once | first declared on line 656 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:657 | Class selector `portion-card` is declared more than once | first declared on line 656 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:657 | Class selector `portion-grid` is declared more than once | first declared on line 650 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:657 | Class selector `field` is declared more than once | first declared on line 656 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:730 | Class selector `test-icon` is declared more than once | first declared on line 714 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:730 | Class selector `test-option` is declared more than once | first declared on line 684 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:735 | Class selector `test-icon` is declared more than once | first declared on line 730 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:735 | Class selector `test-option` is declared more than once | first declared on line 730 |
| warning | medium | styles.hardcoded-colors | src/app/features/exams/exams-list.page.scss:736 | Hardcoded color `#f59e0b` is used instead of a token | hex color literal |
| warning | medium | styles.hardcoded-colors | src/app/features/exams/exams-list.page.scss:737 | Hardcoded color `#b45309` is used instead of a token | hex color literal |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:740 | Class selector `test-icon` is declared more than once | first declared on line 735 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:740 | Class selector `test-option` is declared more than once | first declared on line 735 |
| warning | medium | styles.hardcoded-colors | src/app/features/exams/exams-list.page.scss:741 | Hardcoded color `#f43f5e` is used instead of a token | hex color literal |
| warning | medium | styles.hardcoded-colors | src/app/features/exams/exams-list.page.scss:742 | Hardcoded color `#be123c` is used instead of a token | hex color literal |
| warning | medium | styles.hardcoded-colors | src/app/features/exams/exams-list.page.scss:773 | Hardcoded color `#fff` is used instead of a token | hex color literal |
| warning | medium | styles.hardcoded-colors | src/app/features/exams/exams-list.page.scss:877 | Hardcoded color `#fff` is used instead of a token | hex color literal |
| warning | medium | styles.hardcoded-colors | src/app/features/exams/exams-list.page.scss:919 | Hardcoded color `#e11d48` is used instead of a token | hex color literal |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:930 | Class selector `student-hero` is declared more than once | first declared on line 278 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:931 | Class selector `builder-grid` is declared more than once | first declared on line 425 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:936 | Class selector `create-col` is declared more than once | first declared on line 444 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:940 | Class selector `hero-stats` is declared more than once | first declared on line 395 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:946 | Class selector `portion-grid` is declared more than once | first declared on line 657 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:950 | Class selector `picker` is declared more than once | first declared on line 11 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:954 | Class selector `crumb` is declared more than once | first declared on line 232 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:958 | Class selector `hero-stats` is declared more than once | first declared on line 940 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:962 | Class selector `student-hero` is declared more than once | first declared on line 930 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:966 | Class selector `avatar-xl` is declared more than once | first declared on line 315 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:973 | Class selector `test-grid` is declared more than once | first declared on line 678 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:977 | Class selector `live-scores` is declared more than once | first declared on line 891 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:981 | Class selector `live-row-top` is declared more than once | first declared on line 862 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:985 | Class selector `live-qno` is declared more than once | first declared on line 882 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:989 | Class selector `history-row` is declared more than once | first declared on line 599 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:993 | Class selector `history-type` is declared more than once | first declared on line 622 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:998 | Class selector `memory-highlight` is declared more than once | first declared on line 491 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:1004 | Class selector `test-option` is declared more than once | first declared on line 740 |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/exams-list.page.scss:1005 | Class selector `history-row` is declared more than once | first declared on line 989 |
| warning | medium | tool.jscpd | src/app/features/exams/exams-list.page.spec.ts:223 | Copy-paste clone with `src\app\features\exams\exams-list.page.spec.ts`:260 | jscpd: 12 lines, 94 tokens |
| warning | medium | tool.jscpd | src/app/features/exams/exams-list.page.ts:61 | Copy-paste clone with `src\app\features\planning\season-create.page.ts`:55 | jscpd: 8 lines, 70 tokens |
| warning | medium | clone.function | src/app/features/exams/exams-list.page.ts:63 | Function `todayLocal` shares 12 normalized block(s) with `todayLocal` in src/app/features/exams/weekly-exam.page.ts | function-level Type-2 shingles |
| warning | medium | tool.jscpd | src/app/features/exams/exams-list.page.ts:63 | Copy-paste clone with `src\app\features\exams\weekly-exam.page.ts`:40 | jscpd: 6 lines, 69 tokens |
| warning | medium | clone.function | src/app/features/exams/exams-list.page.ts:63 | Function `todayLocal` shares 12 normalized block(s) with `todayLocal` in src/app/features/planning/season-create.page.ts | function-level Type-2 shingles |
| warning | medium | tool.jscpd | src/app/features/exams/exams-list.page.ts:191 | Copy-paste clone with `src\app\features\exams\weekly-exam.page.ts`:81 | jscpd: 7 lines, 63 tokens |
| warning | high | dead.unused-private-members | src/app/features/exams/exams-list.page.ts:226 | TS6133: 'ownPick' is declared but its value is never read. | tsc --noEmit: 'ownPick' is declared but its value is never read. |
| warning | medium | tool.jscpd | src/app/features/exams/exams-list.page.ts:257 | Copy-paste clone with `src\app\features\exams\weekly-exam.page.ts`:96 | jscpd: 7 lines, 61 tokens |
| warning | high | dead.unused-private-members | src/app/features/exams/exams-list.page.ts:297 | TS6133: 'autoTerm' is declared but its value is never read. | tsc --noEmit: 'autoTerm' is declared but its value is never read. |
| warning | high | dead.unused-private-members | src/app/features/exams/exams-list.page.ts:419 | TS6133: 'seedPortion' is declared but its value is never read. | tsc --noEmit: 'seedPortion' is declared but its value is never read. |
| warning | medium | subscriptions.teardown | src/app/features/exams/exams-list.page.ts:692 | Subscription in `ExamsListPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | tool.jscpd | src/app/features/exams/exams.routes.ts:1 | Copy-paste clone with `src\app\features\results\results.routes.ts`:1 | jscpd: 9 lines, 51 tokens |
| warning | medium | angular.dead-routes | src/app/features/exams/exams.routes.ts:10 | Route `` points at a lazy target that does not resolve | ./exams-list.page |
| warning | medium | angular.dead-routes | src/app/features/exams/exams.routes.ts:22 | Route `weekly` points at a lazy target that does not resolve | ./weekly-exam.page |
| warning | medium | angular.dead-routes | src/app/features/exams/exams.routes.ts:29 | Route `:id` points at a lazy target that does not resolve | ./exam-detail.page |
| warning | medium | styles.duplicate-selectors | src/app/features/exams/weekly-exam.page.scss:9 | Class selector `portion` is declared more than once | first declared on line 3 |
| warning | medium | styles.hardcoded-colors | src/app/features/exams/weekly-exam.page.scss:14 | Hardcoded color `#e6f4ec` is used instead of a token | hex color literal |
| warning | medium | styles.hardcoded-colors | src/app/features/exams/weekly-exam.page.scss:15 | Hardcoded color `#0e9f6e` is used instead of a token | hex color literal |
| warning | medium | tool.jscpd | src/app/features/exams/weekly-exam.page.spec.ts:38 | Copy-paste clone with `src\app\features\students\student-detail.page.spec.ts`:355 | jscpd: 18 lines, 135 tokens |
| warning | medium | tool.jscpd | src/app/features/exams/weekly-exam.page.spec.ts:66 | Copy-paste clone with `src\app\features\groups\groups-list.page.spec.ts`:122 | jscpd: 11 lines, 56 tokens |
| warning | medium | tool.jscpd | src/app/features/exams/weekly-exam.page.spec.ts:137 | Copy-paste clone with `src\app\features\exams\weekly-exam.page.spec.ts`:164 | jscpd: 8 lines, 72 tokens |
| warning | medium | clone.function | src/app/features/exams/weekly-exam.page.ts:40 | Function `todayLocal` shares 12 normalized block(s) with `todayLocal` in src/app/features/planning/season-create.page.ts | function-level Type-2 shingles |
| warning | medium | tool.jscpd | src/app/features/exams/weekly-exam.page.ts:158 | Copy-paste clone with `src\app\features\exams\weekly-exam.page.ts`:175 | jscpd: 7 lines, 65 tokens |
| warning | medium | subscriptions.teardown | src/app/features/exams/weekly-exam.page.ts:218 | Subscription in `WeeklyExamPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.html:233 | Copy-paste clone with `src\app\features\students\students-list.page.html`:106 | jscpd: 6 lines, 62 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:26 | Copy-paste clone with `src\app\features\groups\group-form.page.scss`:10 | jscpd: 7 lines, 51 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:36 | Copy-paste clone with `src\app\features\groups\group-form.page.scss`:36 | jscpd: 36 lines, 243 tokens |
| warning | medium | styles.hardcoded-colors | src/app/features/groups/group-detail.page.scss:64 | Hardcoded color `#fff` is used instead of a token | hex color literal |
| warning | medium | styles.hardcoded-colors | src/app/features/groups/group-detail.page.scss:67 | Hardcoded color `#063325` is used instead of a token | hex color literal |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:88 | Copy-paste clone with `src\app\features\groups\groups-list.page.scss`:6 | jscpd: 10 lines, 64 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:130 | Copy-paste clone with `src\app\features\groups\group-detail.page.scss`:239 | jscpd: 10 lines, 54 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:158 | Copy-paste clone with `src\app\features\groups\groups-list.page.scss`:296 | jscpd: 14 lines, 51 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/group-detail.page.scss:177 | Class selector `day-chip` is declared more than once | first declared on line 45 |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:177 | Copy-paste clone with `src\app\features\groups\groups-list.page.scss`:317 | jscpd: 7 lines, 68 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:183 | Copy-paste clone with `src\app\features\groups\groups-list.page.scss`:323 | jscpd: 8 lines, 60 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:206 | Copy-paste clone with `src\app\features\groups\groups-list.page.scss`:78 | jscpd: 48 lines, 235 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:212 | Copy-paste clone with `src\app\features\groups\group-form.page.scss`:10 | jscpd: 10 lines, 56 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:235 | Copy-paste clone with `src\app\features\groups\group-detail.page.scss`:264 | jscpd: 12 lines, 61 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:235 | Copy-paste clone with `src\app\features\students\student-detail.page.scss`:5 | jscpd: 14 lines, 62 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:239 | Copy-paste clone with `src\app\features\groups\groups-list.page.scss`:111 | jscpd: 17 lines, 96 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:281 | Copy-paste clone with `src\app\features\groups\groups-list.page.scss`:146 | jscpd: 11 lines, 68 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:291 | Copy-paste clone with `src\app\features\groups\groups-list.page.scss`:177 | jscpd: 57 lines, 344 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:307 | Copy-paste clone with `src\app\features\students\students-list.page.scss`:50 | jscpd: 20 lines, 83 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:328 | Copy-paste clone with `src\app\features\groups\groups-list.page.scss`:237 | jscpd: 9 lines, 75 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:345 | Copy-paste clone with `src\app\features\groups\groups-list.page.scss`:253 | jscpd: 26 lines, 144 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:351 | Copy-paste clone with `src\app\features\students\students-list.page.scss`:67 | jscpd: 20 lines, 126 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:372 | Copy-paste clone with `src\app\features\groups\groups-list.page.scss`:282 | jscpd: 9 lines, 65 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:380 | Copy-paste clone with `src\app\features\groups\groups-list.page.scss`:290 | jscpd: 18 lines, 82 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/group-detail.page.scss:402 | Class selector `meta-card` is declared more than once | first declared on line 147 |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/group-detail.page.scss:406 | Class selector `table-wrap` is declared more than once | first declared on line 257 |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/group-detail.page.scss:413 | Class selector `table-head` is declared more than once | first declared on line 262 |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:415 | Copy-paste clone with `src\app\features\groups\groups-list.page.scss`:344 | jscpd: 60 lines, 324 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/group-detail.page.scss:438 | Class selector `row-link` is declared more than once | first declared on line 299 |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/group-detail.page.scss:469 | Class selector `detail-row` is declared more than once | first declared on line 372 |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.scss:474 | Copy-paste clone with `src\app\features\groups\groups-list.page.scss`:405 | jscpd: 14 lines, 54 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/group-detail.page.scss:484 | Class selector `detail-grid` is declared more than once | first declared on line 377 |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/group-detail.page.scss:495 | Class selector `day-chip` is declared more than once | first declared on line 177 |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/group-detail.page.scss:495 | Class selector `day-pick` is declared more than once | first declared on line 40 |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/group-detail.page.scss:499 | Class selector `back-btn` is declared more than once | first declared on line 5 |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/group-detail.page.scss:500 | Class selector `edit-btn` is declared more than once | first declared on line 12 |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/group-detail.page.scss:501 | Class selector `wa-btn` is declared more than once | first declared on line 139 |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/group-detail.page.scss:506 | Class selector `expander` is declared more than once | first declared on line 326 |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.spec.ts:1 | Copy-paste clone with `src\app\features\planning\season-create.page.spec.ts`:1 | jscpd: 11 lines, 53 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.spec.ts:1 | Copy-paste clone with `src\app\features\groups\group-form.page.spec.ts`:1 | jscpd: 13 lines, 68 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.spec.ts:16 | Copy-paste clone with `src\app\features\groups\groups-list.page.spec.ts`:14 | jscpd: 27 lines, 104 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.spec.ts:48 | Copy-paste clone with `src\app\features\groups\groups-list.page.spec.ts`:46 | jscpd: 12 lines, 63 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.spec.ts:135 | Copy-paste clone with `src\app\features\students\student-detail.page.spec.ts`:36 | jscpd: 16 lines, 86 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.spec.ts:168 | Copy-paste clone with `src\app\features\groups\group-form.page.spec.ts`:41 | jscpd: 15 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.spec.ts:183 | Copy-paste clone with `src\app\features\groups\groups-list.page.spec.ts`:100 | jscpd: 8 lines, 57 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.spec.ts:200 | Copy-paste clone with `src\app\features\students\student-detail.page.spec.ts`:125 | jscpd: 8 lines, 50 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.ts:142 | Copy-paste clone with `src\app\features\groups\group-form.page.ts`:196 | jscpd: 6 lines, 61 tokens |
| warning | medium | subscriptions.teardown | src/app/features/groups/group-detail.page.ts:160 | Subscription in `GroupDetailPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | tool.jscpd | src/app/features/groups/group-detail.page.ts:175 | Copy-paste clone with `src\app\features\groups\groups-list.page.ts`:180 | jscpd: 9 lines, 50 tokens |
| warning | high | dead.unused-private-members | src/app/features/groups/group-detail.page.ts:190 | TS6133: 'instant' is declared but its value is never read. | tsc --noEmit: 'instant' is declared but its value is never read. |
| warning | medium | styles.hardcoded-colors | src/app/features/groups/group-form.page.scss:64 | Hardcoded color `#fff` is used instead of a token | hex color literal |
| warning | medium | styles.hardcoded-colors | src/app/features/groups/group-form.page.scss:67 | Hardcoded color `#063325` is used instead of a token | hex color literal |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/group-form.page.scss:75 | Class selector `day-pick` is declared more than once | first declared on line 40 |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/group-form.page.scss:75 | Class selector `day-chip` is declared more than once | first declared on line 45 |
| warning | medium | tool.jscpd | src/app/features/groups/group-form.page.spec.ts:63 | Copy-paste clone with `src\app\features\planning\seasons-list.page.spec.ts`:83 | jscpd: 9 lines, 56 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-form.page.spec.ts:73 | Copy-paste clone with `src\app\features\planning\season-create.page.spec.ts`:52 | jscpd: 9 lines, 61 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-form.page.spec.ts:146 | Copy-paste clone with `src\app\features\planning\seasons-list.page.spec.ts`:115 | jscpd: 9 lines, 55 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-form.page.spec.ts:156 | Copy-paste clone with `src\app\features\planning\season-create.page.spec.ts`:76 | jscpd: 10 lines, 56 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-form.page.ts:1 | Copy-paste clone with `src\app\features\planning\term-detail.page.ts`:1 | jscpd: 15 lines, 54 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-form.page.ts:64 | Copy-paste clone with `src\app\features\planning\season-create.page.ts`:98 | jscpd: 10 lines, 91 tokens |
| warning | high | structure.explicit-any | src/app/features/groups/group-form.page.ts:84 | Explicit `any` weakens type safety | /** Dirty guard: any filled composer field blocks route leave. */ |
| warning | medium | tool.jscpd | src/app/features/groups/group-form.page.ts:116 | Copy-paste clone with `src\app\features\users\user-detail.page.ts`:109 | jscpd: 7 lines, 59 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-form.page.ts:124 | Copy-paste clone with `src\app\features\users\user-detail.page.ts`:117 | jscpd: 7 lines, 73 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/group-form.page.ts:141 | Copy-paste clone with `src\app\features\planning\season-create.page.ts`:150 | jscpd: 6 lines, 65 tokens |
| warning | medium | subscriptions.teardown | src/app/features/groups/group-form.page.ts:216 | Subscription in `GroupFormPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/features/groups/group-form.page.ts:241 | Subscription in `GroupFormPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | tool.jscpd | src/app/features/groups/groups-list.page.html:38 | Copy-paste clone with `src\app\features\students\students-list.page.html`:79 | jscpd: 13 lines, 90 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/groups-list.page.html:43 | Copy-paste clone with `src\app\features\registrations\registrations.page.html`:7 | jscpd: 7 lines, 53 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/groups-list.page.html:234 | Copy-paste clone with `src\app\features\users\users-list.page.html`:100 | jscpd: 17 lines, 64 tokens |
| warning | medium | tool.jscpd | src/app/features/groups/groups-list.page.html:322 | Copy-paste clone with `src\app\features\groups\groups-list.page.html`:333 | jscpd: 8 lines, 52 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/groups-list.page.scss:340 | Class selector `table-wrap` is declared more than once | first declared on line 136 |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/groups-list.page.scss:367 | Class selector `row-link` is declared more than once | first declared on line 185 |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/groups-list.page.scss:398 | Class selector `detail-row` is declared more than once | first declared on line 282 |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/groups-list.page.scss:415 | Class selector `detail-grid` is declared more than once | first declared on line 287 |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/groups-list.page.scss:422 | Class selector `expander` is declared more than once | first declared on line 212 |
| warning | medium | styles.duplicate-selectors | src/app/features/groups/groups-list.page.scss:423 | Class selector `pencil` is declared more than once | first declared on line 236 |
| warning | medium | angular.dead-routes | src/app/features/groups/groups.routes.ts:6 | Route `` points at a lazy target that does not resolve | ./groups-list.page |
| warning | medium | angular.dead-routes | src/app/features/groups/groups.routes.ts:12 | Route `new` points at a lazy target that does not resolve | ./group-form.page |
| warning | medium | tool.jscpd | src/app/features/groups/groups.routes.ts:13 | Copy-paste clone with `src\app\features\groups\groups.routes.ts`:23 | jscpd: 11 lines, 51 tokens |
| warning | medium | angular.dead-routes | src/app/features/groups/groups.routes.ts:19 | Route `:id/edit` points at a lazy target that does not resolve | ./group-form.page |
| warning | medium | angular.dead-routes | src/app/features/groups/groups.routes.ts:29 | Route `:id` points at a lazy target that does not resolve | ./group-detail.page |
| warning | medium | tool.jscpd | src/app/features/levels/levels.page.html:144 | Copy-paste clone with `src\app\features\levels\levels.page.html`:318 | jscpd: 10 lines, 50 tokens |
| warning | medium | tool.jscpd | src/app/features/levels/levels.page.html:154 | Copy-paste clone with `src\app\features\levels\levels.page.html`:328 | jscpd: 9 lines, 51 tokens |
| warning | medium | tool.jscpd | src/app/features/levels/levels.page.html:162 | Copy-paste clone with `src\app\features\levels\levels.page.html`:336 | jscpd: 10 lines, 50 tokens |
| warning | medium | tool.jscpd | src/app/features/levels/levels.page.html:172 | Copy-paste clone with `src\app\features\levels\levels.page.html`:346 | jscpd: 10 lines, 54 tokens |
| warning | medium | tool.jscpd | src/app/features/levels/levels.page.html:181 | Copy-paste clone with `src\app\features\levels\levels.page.html`:355 | jscpd: 7 lines, 55 tokens |
| warning | medium | tool.jscpd | src/app/features/levels/levels.page.html:187 | Copy-paste clone with `src\app\features\levels\levels.page.html`:361 | jscpd: 8 lines, 60 tokens |
| warning | medium | tool.jscpd | src/app/features/levels/levels.page.scss:1 | Copy-paste clone with `src\app\features\students\students-list.page.scss`:1 | jscpd: 13 lines, 53 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/levels/levels.page.scss:19 | Class selector `levels-table` is declared more than once | first declared on line 13 |
| warning | medium | styles.duplicate-selectors | src/app/features/levels/levels.page.scss:20 | Class selector `levels-table` is declared more than once | first declared on line 19 |
| warning | medium | styles.duplicate-selectors | src/app/features/levels/levels.page.scss:27 | Class selector `levels-table` is declared more than once | first declared on line 20 |
| warning | medium | styles.duplicate-selectors | src/app/features/levels/levels.page.scss:37 | Class selector `levels-table` is declared more than once | first declared on line 27 |
| warning | medium | styles.duplicate-selectors | src/app/features/levels/levels.page.scss:38 | Class selector `levels-table` is declared more than once | first declared on line 37 |
| warning | medium | styles.duplicate-selectors | src/app/features/levels/levels.page.scss:44 | Class selector `levels-table` is declared more than once | first declared on line 38 |
| warning | medium | styles.duplicate-selectors | src/app/features/levels/levels.page.scss:161 | Class selector `btn-sm` is declared more than once | first declared on line 48 |
| warning | medium | tool.jscpd | src/app/features/levels/levels.page.spec.ts:1 | Copy-paste clone with `src\app\features\users\users-list.page.spec.ts`:1 | jscpd: 11 lines, 50 tokens |
| warning | medium | tool.jscpd | src/app/features/levels/levels.page.spec.ts:85 | Copy-paste clone with `src\app\features\levels\levels.page.spec.ts`:101 | jscpd: 9 lines, 56 tokens |
| warning | medium | tool.jscpd | src/app/features/levels/levels.page.spec.ts:159 | Copy-paste clone with `src\app\features\users\users-list.page.spec.ts`:82 | jscpd: 11 lines, 76 tokens |
| warning | medium | tool.jscpd | src/app/features/levels/levels.page.spec.ts:159 | Copy-paste clone with `src\app\features\planning\season-create.page.spec.ts`:68 | jscpd: 11 lines, 76 tokens |
| warning | medium | subscriptions.teardown | src/app/features/levels/levels.page.ts:276 | Subscription in `LevelsPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/features/levels/levels.page.ts:453 | Subscription in `LevelsPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/features/levels/levels.page.ts:475 | Subscription in `LevelsPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | tool.jscpd | src/app/features/levels/levels.page.ts:499 | Copy-paste clone with `src\app\features\scoring\scoring.page.ts`:362 | jscpd: 12 lines, 80 tokens |
| warning | medium | subscriptions.teardown | src/app/features/levels/levels.page.ts:499 | Subscription in `LevelsPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | clone.type2 | src/app/features/levels/levels.routes.ts:1 | Type-2 (renamed) clone: src/app/features/levels/levels.routes.ts shares 36 normalized token block(s) with src/app/features/notifications/notifications.routes.ts | Type-2 (renamed) clone: 40 tokens, 36 shared blocks |
| warning | medium | clone.type2 | src/app/features/levels/levels.routes.ts:1 | Type-2 (renamed) clone: src/app/features/levels/levels.routes.ts shares 36 normalized token block(s) with src/app/features/news/news.routes.ts | Type-2 (renamed) clone: 40 tokens, 36 shared blocks |
| warning | medium | clone.type2 | src/app/features/levels/levels.routes.ts:1 | Type-2 (renamed) clone: src/app/features/levels/levels.routes.ts shares 36 normalized token block(s) with src/app/features/reviews/reviews.routes.ts | Type-2 (renamed) clone: 40 tokens, 36 shared blocks |
| warning | medium | clone.type2 | src/app/features/levels/levels.routes.ts:1 | Type-2 (renamed) clone: src/app/features/levels/levels.routes.ts shares 43 normalized token block(s) with src/app/features/scoring/scoring.routes.ts | Type-2 (renamed) clone: 40 tokens, 43 shared blocks |
| warning | medium | angular.dead-routes | src/app/features/levels/levels.routes.ts:6 | Route `` points at a lazy target that does not resolve | ./levels.page |
| info | medium | git.churn-hotspot | src/app/features/news/news.page.html:1 | Churn hotspot: 14 changes across 145 LOC (score 101) | git churn × function complexity |
| warning | medium | tool.jscpd | src/app/features/news/news.page.html:58 | Copy-paste clone with `src\app\features\notifications\notifications.page.html`:35 | jscpd: 9 lines, 84 tokens |
| warning | medium | tool.jscpd | src/app/features/news/news.page.spec.ts:49 | Copy-paste clone with `src\app\features\students\student-detail.page.spec.ts`:125 | jscpd: 9 lines, 55 tokens |
| warning | medium | tool.jscpd | src/app/features/news/news.page.spec.ts:74 | Copy-paste clone with `src\app\features\news\news.page.spec.ts`:104 | jscpd: 6 lines, 63 tokens |
| warning | medium | tool.jscpd | src/app/features/news/news.page.spec.ts:80 | Copy-paste clone with `src\app\features\news\news.page.spec.ts`:115 | jscpd: 9 lines, 60 tokens |
| warning | medium | subscriptions.teardown | src/app/features/news/news.page.ts:97 | Subscription in `NewsPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/features/news/news.page.ts:143 | Subscription in `NewsPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/features/news/news.page.ts:166 | Subscription in `NewsPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/features/news/news.page.ts:186 | Subscription in `NewsPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | clone.type2 | src/app/features/news/news.routes.ts:1 | Type-2 (renamed) clone: src/app/features/news/news.routes.ts shares 37 normalized token block(s) with src/app/features/scoring/scoring.routes.ts | Type-2 (renamed) clone: 40 tokens, 37 shared blocks |
| warning | medium | angular.dead-routes | src/app/features/news/news.routes.ts:6 | Route `` points at a lazy target that does not resolve | ./news.page |
| warning | medium | tool.jscpd | src/app/features/notifications/notifications.page.ts:54 | Copy-paste clone with `src\app\features\reviews\reviews.page.ts`:178 | jscpd: 9 lines, 63 tokens |
| warning | medium | subscriptions.teardown | src/app/features/notifications/notifications.page.ts:54 | Subscription in `NotificationsPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/features/notifications/notifications.page.ts:65 | Subscription in `NotificationsPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/features/notifications/notifications.page.ts:69 | Subscription in `NotificationsPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | clone.type2 | src/app/features/notifications/notifications.routes.ts:1 | Type-2 (renamed) clone: src/app/features/notifications/notifications.routes.ts shares 48 normalized token block(s) with src/app/features/reviews/reviews.routes.ts | Type-2 (renamed) clone: 40 tokens, 48 shared blocks |
| warning | medium | clone.type2 | src/app/features/notifications/notifications.routes.ts:1 | Type-2 (renamed) clone: src/app/features/notifications/notifications.routes.ts shares 37 normalized token block(s) with src/app/features/scoring/scoring.routes.ts | Type-2 (renamed) clone: 40 tokens, 37 shared blocks |
| warning | medium | angular.dead-routes | src/app/features/notifications/notifications.routes.ts:6 | Route `` points at a lazy target that does not resolve | ./notifications.page |
| warning | medium | angular.dead-routes | src/app/features/planning/planning.routes.ts:8 | Route `` points at a lazy target that does not resolve | ./seasons-list.page |
| warning | medium | angular.dead-routes | src/app/features/planning/planning.routes.ts:14 | Route `new` points at a lazy target that does not resolve | ./season-create.page |
| warning | medium | angular.dead-routes | src/app/features/planning/planning.routes.ts:21 | Route `calendar` points at a lazy target that does not resolve | ./seasons-calendar.page |
| warning | medium | angular.dead-routes | src/app/features/planning/planning.routes.ts:29 | Route `:id/edit` points at a lazy target that does not resolve | ./season-create.page |
| warning | medium | angular.dead-routes | src/app/features/planning/planning.routes.ts:38 | Route `terms/:id` points at a lazy target that does not resolve | ./term-detail.page |
| warning | medium | angular.dead-routes | src/app/features/planning/planning.routes.ts:45 | Route `plans` points at a lazy target that does not resolve | ./plans.page |
| warning | medium | tool.jscpd | src/app/features/planning/plans.page.html:3 | Copy-paste clone with `src\app\features\results\season-results.page.html`:3 | jscpd: 25 lines, 131 tokens |
| warning | medium | tool.jscpd | src/app/features/planning/plans.page.html:3 | Copy-paste clone with `src\app\features\reviews\reviews.page.html`:3 | jscpd: 11 lines, 61 tokens |
| warning | medium | tool.jscpd | src/app/features/planning/plans.page.html:6 | Copy-paste clone with `src\app\features\reports\season-report.page.html`:6 | jscpd: 22 lines, 114 tokens |
| warning | medium | tool.jscpd | src/app/features/planning/plans.page.html:14 | Copy-paste clone with `src\app\features\reviews\reviews.page.html`:15 | jscpd: 15 lines, 74 tokens |
| warning | medium | tool.jscpd | src/app/features/planning/plans.page.html:17 | Copy-paste clone with `src\app\features\reports\term-report.page.html`:17 | jscpd: 12 lines, 50 tokens |
| warning | medium | tool.jscpd | src/app/features/planning/plans.page.html:17 | Copy-paste clone with `src\app\features\reviews\reviews.page.html`:18 | jscpd: 14 lines, 52 tokens |
| warning | medium | clone.type2 | src/app/features/planning/plans.page.ts:1 | Type-2 (renamed) clone: src/app/features/planning/plans.page.ts shares 269 normalized token block(s) with src/app/features/reports/term-report.page.ts | Type-2 (renamed) clone: 40 tokens, 269 shared blocks |
| warning | medium | tool.jscpd | src/app/features/planning/plans.page.ts:33 | Copy-paste clone with `src\app\features\reports\term-report.page.ts`:33 | jscpd: 10 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/features/planning/plans.page.ts:44 | Copy-paste clone with `src\app\features\reviews\reviews.page.ts`:68 | jscpd: 16 lines, 122 tokens |
| warning | medium | tool.jscpd | src/app/features/planning/plans.page.ts:44 | Copy-paste clone with `src\app\features\reports\term-report.page.ts`:46 | jscpd: 20 lines, 183 tokens |
| warning | medium | tool.jscpd | src/app/features/planning/plans.page.ts:44 | Copy-paste clone with `src\app\features\results\season-results.page.ts`:42 | jscpd: 14 lines, 120 tokens |
| warning | medium | tool.jscpd | src/app/features/planning/plans.page.ts:44 | Copy-paste clone with `src\app\features\reports\season-report.page.ts`:23 | jscpd: 14 lines, 126 tokens |
| warning | medium | tool.jscpd | src/app/features/planning/plans.page.ts:52 | Copy-paste clone with `src\app\features\results\term-results.page.ts`:88 | jscpd: 12 lines, 99 tokens |
| warning | medium | tool.jscpd | src/app/features/planning/plans.page.ts:56 | Copy-paste clone with `src\app\features\reviews\reviews.page.ts`:94 | jscpd: 8 lines, 67 tokens |
| warning | medium | tool.jscpd | src/app/features/planning/plans.page.ts:67 | Copy-paste clone with `src\app\features\reports\season-report.page.ts`:35 | jscpd: 9 lines, 59 tokens |
| warning | medium | tool.jscpd | src/app/features/planning/plans.page.ts:67 | Copy-paste clone with `src\app\features\reports\term-report.page.ts`:64 | jscpd: 9 lines, 58 tokens |
| warning | medium | tool.jscpd | src/app/features/planning/plans.page.ts:68 | Copy-paste clone with `src\app\features\reviews\reviews.page.ts`:126 | jscpd: 8 lines, 54 tokens |
| warning | medium | subscriptions.teardown | src/app/features/planning/plans.page.ts:163 | Subscription in `PlansPage` has no detected teardown | no matching teardown found in this class |
| info | medium | git.churn-hotspot | src/app/features/planning/season-create.page.html:1 | Churn hotspot: 16 changes across 128 LOC (score 112) | git churn × function complexity |
| warning | medium | tool.jscpd | src/app/features/planning/season-create.page.spec.ts:73 | Copy-paste clone with `src\app\features\users\users-list.page.spec.ts`:87 | jscpd: 9 lines, 67 tokens |
| warning | medium | tool.jscpd | src/app/features/planning/season-create.page.spec.ts:118 | Copy-paste clone with `src\app\features\planning\seasons-list.page.spec.ts`:148 | jscpd: 6 lines, 54 tokens |
| warning | medium | subscriptions.teardown | src/app/features/planning/season-create.page.ts:218 | Subscription in `SeasonCreatePage` has no detected teardown | no matching teardown found in this class |
| warning | medium | tool.jscpd | src/app/features/planning/season-create.page.ts:223 | Copy-paste clone with `src\app\features\planning\season-create.page.ts`:251 | jscpd: 14 lines, 78 tokens |
| warning | medium | subscriptions.teardown | src/app/features/planning/season-create.page.ts:244 | Subscription in `SeasonCreatePage` has no detected teardown | no matching teardown found in this class |
| warning | medium | dead.unused-exports | src/app/features/planning/seasons-calendar.helpers.ts:99 | Exported binding `YearDay` is not imported by any analyzed module | no static consumer resolved · dynamic/template/public API usage is not excluded |
| warning | medium | dead.unused-exports | src/app/features/planning/seasons-calendar.helpers.ts:108 | Exported binding `YearMonth` is not imported by any analyzed module | no static consumer resolved · dynamic/template/public API usage is not excluded |
| warning | high | structure.complexity | src/app/features/planning/seasons-calendar.helpers.ts:211 | Function `resolveWeekDrop` cyclomatic complexity 14 exceeds 10 | cyclomatic=14 · cognitive=14 · loc=23 |
| info | medium | git.churn-hotspot | src/app/features/planning/seasons-calendar.helpers.ts:211 | Function hotspot `resolveWeekDrop`: 10 changes, cyclomatic 14, cognitive 14, 23 LOC (score 140) | git churn × function complexity |
| info | low | subscriptions.subject | src/app/features/planning/seasons-calendar.page.ts:153 | Subject `Subject` in `SeasonsCalendarPage` has no complete() evidence | missing complete() alone does not prove a leak · review retained subscribers and lifetime |
| warning | high | structure.explicit-any | src/app/features/planning/seasons-calendar.page.ts:166 | Explicit `any` weakens type safety | /** The current-view events JSON panel: anyone with calendar access sees it |
| warning | medium | subscriptions.teardown | src/app/features/planning/seasons-calendar.page.ts:552 | Subscription in `SeasonsCalendarPage` has no detected teardown | teardown calls exist in this class but none match this resource |
| warning | medium | tool.jscpd | src/app/features/planning/seasons-list.page.ts:215 | Copy-paste clone with `src\app\features\users\users-list.page.ts`:164 | jscpd: 15 lines, 69 tokens |
| warning | medium | subscriptions.teardown | src/app/features/planning/seasons-list.page.ts:215 | Subscription in `SeasonsListPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/features/planning/seasons-list.page.ts:229 | Subscription in `SeasonsListPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/features/planning/seasons-list.page.ts:256 | Subscription in `SeasonsListPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | tool.jscpd | src/app/features/planning/session-range-picker.component.spec.ts:50 | Copy-paste clone with `src\app\shared\ui\date-picker\date-picker.component.spec.ts`:44 | jscpd: 11 lines, 55 tokens |
| warning | medium | tool.jscpd | src/app/features/planning/term-detail.page.html:1 | Copy-paste clone with `src\app\features\students\student-detail.page.html`:1 | jscpd: 7 lines, 55 tokens |
| warning | medium | subscriptions.teardown | src/app/features/planning/term-detail.page.ts:120 | Subscription in `TermDetailPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/features/planning/term-detail.page.ts:133 | Subscription in `TermDetailPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/features/planning/term-detail.page.ts:137 | Subscription in `TermDetailPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | styles.duplicate-selectors | src/app/features/registrations/registrations.page.scss:90 | Class selector `req-actions` is declared more than once | first declared on line 84 |
| warning | medium | styles.unused-selectors | src/app/features/registrations/registrations.page.scss:96 | Class selector `req-error` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | tool.jscpd | src/app/features/registrations/registrations.page.spec.ts:142 | Copy-paste clone with `src\app\features\registrations\registrations.page.spec.ts`:258 | jscpd: 8 lines, 55 tokens |
| warning | medium | tool.jscpd | src/app/features/registrations/registrations.page.spec.ts:144 | Copy-paste clone with `src\app\features\registrations\registrations.page.spec.ts`:209 | jscpd: 7 lines, 52 tokens |
| warning | medium | tool.jscpd | src/app/features/registrations/registrations.page.spec.ts:145 | Copy-paste clone with `src\app\features\registrations\registrations.page.spec.ts`:239 | jscpd: 7 lines, 66 tokens |
| warning | medium | tool.jscpd | src/app/features/registrations/registrations.page.spec.ts:150 | Copy-paste clone with `src\app\features\registrations\registrations.page.spec.ts`:215 | jscpd: 11 lines, 96 tokens |
| warning | medium | tool.jscpd | src/app/features/registrations/registrations.page.spec.ts:151 | Copy-paste clone with `src\app\features\registrations\registrations.page.spec.ts`:246 | jscpd: 9 lines, 61 tokens |
| warning | medium | tool.jscpd | src/app/features/registrations/registrations.page.spec.ts:167 | Copy-paste clone with `src\app\features\registrations\registrations.page.spec.ts`:230 | jscpd: 9 lines, 52 tokens |
| warning | medium | subscriptions.teardown | src/app/features/registrations/registrations.page.ts:145 | Subscription in `RegistrationsPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/features/registrations/registrations.page.ts:167 | Subscription in `RegistrationsPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | tool.jscpd | src/app/features/registrations/registrations.page.ts:174 | Copy-paste clone with `src\app\features\users\users-list.page.ts`:204 | jscpd: 12 lines, 78 tokens |
| warning | medium | clone.type2 | src/app/features/registrations/registrations.routes.ts:1 | Type-2 (renamed) clone: src/app/features/registrations/registrations.routes.ts shares 30 normalized token block(s) with src/app/features/settings/settings.routes.ts | Type-2 (renamed) clone: 40 tokens, 30 shared blocks |
| warning | medium | angular.dead-routes | src/app/features/registrations/registrations.routes.ts:5 | Route `` points at a lazy target that does not resolve | ./registrations.page |
| warning | medium | clone.type2 | src/app/features/reports/reports.routes.ts:1 | Type-2 (renamed) clone: src/app/features/reports/reports.routes.ts shares 67 normalized token block(s) with src/app/features/students/students.routes.ts | Type-2 (renamed) clone: 40 tokens, 67 shared blocks |
| warning | medium | angular.dead-routes | src/app/features/reports/reports.routes.ts:7 | Route `term` points at a lazy target that does not resolve | ./term-report.page |
| warning | medium | angular.dead-routes | src/app/features/reports/reports.routes.ts:13 | Route `season` points at a lazy target that does not resolve | ./season-report.page |
| warning | medium | tool.jscpd | src/app/features/reports/season-report.page.html:3 | Copy-paste clone with `src\app\features\reports\term-report.page.html`:3 | jscpd: 25 lines, 131 tokens |
| warning | medium | tool.jscpd | src/app/features/reports/season-report.page.html:17 | Copy-paste clone with `src\app\features\results\season-results.page.html`:17 | jscpd: 12 lines, 52 tokens |
| warning | medium | tool.jscpd | src/app/features/reports/season-report.page.html:27 | Copy-paste clone with `src\app\features\reports\term-report.page.html`:36 | jscpd: 12 lines, 73 tokens |
| warning | medium | clone.type2 | src/app/features/reports/season-report.page.ts:1 | Type-2 (renamed) clone: src/app/features/reports/season-report.page.ts shares 266 normalized token block(s) with src/app/features/results/season-results.page.ts | Type-2 (renamed) clone: 40 tokens, 266 shared blocks |
| warning | medium | tool.jscpd | src/app/features/reports/season-report.page.ts:30 | Copy-paste clone with `src\app\features\results\season-results.page.ts`:49 | jscpd: 14 lines, 101 tokens |
| warning | medium | tool.jscpd | src/app/features/reports/season-report.page.ts:38 | Copy-paste clone with `src\app\features\reports\term-report.page.ts`:67 | jscpd: 7 lines, 69 tokens |
| warning | medium | tool.jscpd | src/app/features/reports/term-report.page.ts:41 | Copy-paste clone with `src\app\features\reviews\reviews.page.ts`:105 | jscpd: 8 lines, 62 tokens |
| warning | medium | tool.jscpd | src/app/features/reports/term-report.page.ts:62 | Copy-paste clone with `src\app\features\reviews\reviews.page.ts`:98 | jscpd: 6 lines, 50 tokens |
| warning | medium | tool.jscpd | src/app/features/reports/term-report.page.ts:62 | Copy-paste clone with `src\app\features\results\term-results.page.ts`:96 | jscpd: 7 lines, 65 tokens |
| warning | medium | angular.dead-routes | src/app/features/results/results.routes.ts:10 | Route `term` points at a lazy target that does not resolve | ./term-results.page |
| warning | medium | angular.dead-routes | src/app/features/results/results.routes.ts:17 | Route `season` points at a lazy target that does not resolve | ./season-results.page |
| warning | medium | subscriptions.teardown | src/app/features/results/season-results.page.ts:106 | Subscription in `SeasonResultsPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | tool.jscpd | src/app/features/results/term-breakdown-panel.component.html:4 | Copy-paste clone with `src\app\features\results\term-results.page.html`:4 | jscpd: 13 lines, 52 tokens |
| warning | medium | tool.jscpd | src/app/features/results/term-breakdown-panel.component.html:110 | Copy-paste clone with `src\app\features\results\term-breakdown-panel.component.html`:173 | jscpd: 12 lines, 50 tokens |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:52 | Class selector `25rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:52 | Class selector `92rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:52 | Class selector `35vw` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:67 | Class selector `07em` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:77 | Class selector `7fr` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:77 | Class selector `3fr` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:100 | Class selector `03em` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:111 | Class selector `2rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:111 | Class selector `6rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:111 | Class selector `2rem` is declared more than once | first declared on line 111 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:118 | Class selector `78rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:125 | Class selector `7rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | tool.jscpd | src/app/features/results/term-breakdown-panel.component.scss:143 | Copy-paste clone with `src\app\features\results\term-breakdown-panel.component.scss`:481 | jscpd: 13 lines, 63 tokens |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:148 | Class selector `68rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:153 | Class selector `05rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:178 | Class selector `76rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:187 | Class selector `66rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:201 | Class selector `55` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | tool.jscpd | src/app/features/results/term-breakdown-panel.component.scss:263 | Copy-paste clone with `src\app\features\results\term-breakdown-panel.component.scss`:373 | jscpd: 11 lines, 50 tokens |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:284 | Class selector `78rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:284 | Class selector `78rem` is declared more than once | first declared on line 118 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:315 | Class selector `05rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:315 | Class selector `05rem` is declared more than once | first declared on line 153 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:351 | Class selector `74rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:361 | Class selector `82rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:363 | Class selector `35` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:389 | Class selector `9rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:395 | Class selector `6rem` is declared more than once | first declared on line 111 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:395 | Class selector `6rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:400 | Class selector `proof-score` is declared more than once | first declared on line 384 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:441 | Class selector `82rem` is declared more than once | first declared on line 361 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:441 | Class selector `82rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:447 | Class selector `68rem` is declared more than once | first declared on line 148 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:447 | Class selector `68rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:459 | Class selector `8rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:465 | Class selector `76rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:465 | Class selector `76rem` is declared more than once | first declared on line 178 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:486 | Class selector `68rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:486 | Class selector `68rem` is declared more than once | first declared on line 447 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:491 | Class selector `05rem` is declared more than once | first declared on line 315 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:491 | Class selector `05rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:497 | Class selector `62rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:504 | Class selector `76rem` is declared more than once | first declared on line 465 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:504 | Class selector `76rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:505 | Class selector `55` is declared more than once | first declared on line 201 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-breakdown-panel.component.scss:505 | Class selector `55` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:509 | Class selector `audit-summary` is declared more than once | first declared on line 75 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:513 | Class selector `summary-stats` is declared more than once | first declared on line 129 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:517 | Class selector `audit-table` is declared more than once | first declared on line 166 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:521 | Class selector `general-components` is declared more than once | first declared on line 469 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:527 | Class selector `audit-head` is declared more than once | first declared on line 23 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:531 | Class selector `audit-close` is declared more than once | first declared on line 71 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:535 | Class selector `summary-stats` is declared more than once | first declared on line 513 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:539 | Class selector `proof-question` is declared more than once | first declared on line 327 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:543 | Class selector `proof-score` is declared more than once | first declared on line 400 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:547 | Class selector `proof-max` is declared more than once | first declared on line 383 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-breakdown-panel.component.scss:553 | Class selector `proof-question` is declared more than once | first declared on line 539 |
| info | medium | git.churn-hotspot | src/app/features/results/term-results.page.html:1 | Churn hotspot: 11 changes across 690 LOC (score 104) | git churn × function complexity |
| warning | medium | tool.jscpd | src/app/features/results/term-results.page.html:60 | Copy-paste clone with `src\app\features\results\term-results.page.html`:78 | jscpd: 12 lines, 50 tokens |
| warning | medium | tool.jscpd | src/app/features/results/term-results.page.html:61 | Copy-paste clone with `src\app\features\results\term-results.page.html`:291 | jscpd: 15 lines, 68 tokens |
| warning | medium | tool.jscpd | src/app/features/results/term-results.page.html:79 | Copy-paste clone with `src\app\features\results\term-results.page.html`:454 | jscpd: 17 lines, 62 tokens |
| warning | medium | tool.jscpd | src/app/features/results/term-results.page.html:99 | Copy-paste clone with `src\app\features\results\term-results.page.html`:474 | jscpd: 15 lines, 71 tokens |
| warning | medium | tool.jscpd | src/app/features/results/term-results.page.html:99 | Copy-paste clone with `src\app\features\results\term-results.page.html`:271 | jscpd: 15 lines, 71 tokens |
| warning | medium | tool.jscpd | src/app/features/results/term-results.page.html:124 | Copy-paste clone with `src\app\features\results\term-results.page.html`:192 | jscpd: 11 lines, 88 tokens |
| warning | medium | tool.jscpd | src/app/features/results/term-results.page.html:244 | Copy-paste clone with `src\app\features\results\term-results.page.html`:594 | jscpd: 13 lines, 60 tokens |
| warning | medium | tool.jscpd | src/app/features/results/term-results.page.html:626 | Copy-paste clone with `src\app\features\scoring\scoring.page.html`:434 | jscpd: 16 lines, 69 tokens |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:10 | Class selector `5vw` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:24 | Class selector `5vw` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:24 | Class selector `5vw` is declared more than once | first declared on line 10 |
| warning | medium | tool.jscpd | src/app/features/results/term-results.page.scss:28 | Copy-paste clone with `src\app\features\results\term-results.page.scss`:172 | jscpd: 13 lines, 74 tokens |
| warning | medium | tool.jscpd | src/app/features/results/term-results.page.scss:43 | Copy-paste clone with `src\app\features\scoring\scoring.page.scss`:51 | jscpd: 14 lines, 58 tokens |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:50 | Class selector `2rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:50 | Class selector `5rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:50 | Class selector `1vw` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:51 | Class selector `15` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:52 | Class selector `015em` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:60 | Class selector `45` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:95 | Class selector `045em` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:116 | Class selector `35` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:120 | Class selector `meta-chip` is declared more than once | first declared on line 106 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:130 | Class selector `status-chip` is declared more than once | first declared on line 107 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:164 | Class selector `55` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:231 | Class selector `card` is declared more than once | first declared on line 145 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:233 | Class selector `8vw` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:251 | Class selector `25` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:259 | Class selector `45` is declared more than once | first declared on line 60 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:259 | Class selector `45` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | tool.jscpd | src/app/features/results/term-results.page.scss:265 | Copy-paste clone with `src\app\features\scoring\scoring.page.scss`:851 | jscpd: 6 lines, 56 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:296 | Class selector `btn` is declared more than once | first declared on line 167 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:401 | Class selector `05rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:403 | Class selector `16` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:409 | Class selector `3rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:417 | Class selector `35` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:417 | Class selector `35` is declared more than once | first declared on line 116 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:441 | Class selector `25rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:491 | Class selector `5` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:502 | Class selector `card` is declared more than once | first declared on line 231 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:510 | Class selector `dd` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:538 | Class selector `3` is declared more than once | first declared on line 81 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:588 | Class selector `5` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:588 | Class selector `5` is declared more than once | first declared on line 491 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:591 | Class selector `btn` is declared more than once | first declared on line 296 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:603 | Class selector `card` is declared more than once | first declared on line 502 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:622 | Class selector `55` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:622 | Class selector `55` is declared more than once | first declared on line 164 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:655 | Class selector `3` is declared more than once | first declared on line 538 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:662 | Class selector `45` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:662 | Class selector `45` is declared more than once | first declared on line 259 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:684 | Class selector `banner` is declared more than once | first declared on line 666 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:690 | Class selector `banner` is declared more than once | first declared on line 684 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:717 | Class selector `3` is declared more than once | first declared on line 655 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:749 | Class selector `02em` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:751 | Class selector `8` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:754 | Class selector `audit-cta` is declared more than once | first declared on line 744 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:755 | Class selector `audit-cta` is declared more than once | first declared on line 754 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:771 | Class selector `5px` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:777 | Class selector `1rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:836 | Class selector `5px` is declared more than once | first declared on line 771 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:836 | Class selector `5px` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:843 | Class selector `45` is declared more than once | first declared on line 662 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:843 | Class selector `45` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:848 | Class selector `72` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:897 | Class selector `card` is declared more than once | first declared on line 603 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:909 | Class selector `8vw` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:909 | Class selector `8vw` is declared more than once | first declared on line 233 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:929 | Class selector `25` is declared more than once | first declared on line 251 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:929 | Class selector `25` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:936 | Class selector `4` is declared more than once | first declared on line 461 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:948 | Class selector `average-panel` is declared more than once | first declared on line 755 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:979 | Class selector `2rem` is declared more than once | first declared on line 50 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:979 | Class selector `2rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:979 | Class selector `2vw` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:979 | Class selector `7rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:999 | Class selector `score-tile` is declared more than once | first declared on line 754 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1013 | Class selector `35` is declared more than once | first declared on line 417 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:1013 | Class selector `35` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:1018 | Class selector `45rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:1018 | Class selector `55vw` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:1018 | Class selector `15rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:1048 | Class selector `5` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1048 | Class selector `5` is declared more than once | first declared on line 588 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:1073 | Class selector `5` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1073 | Class selector `5` is declared more than once | first declared on line 1048 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1079 | Class selector `card-go` is declared more than once | first declared on line 471 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1084 | Class selector `student-avatar` is declared more than once | first declared on line 392 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1085 | Class selector `selected-check` is declared more than once | first declared on line 376 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1086 | Class selector `pick-prompt-icon` is declared more than once | first declared on line 626 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1094 | Class selector `result-overview` is declared more than once | first declared on line 941 |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:1095 | Class selector `7fr` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/results/term-results.page.scss:1095 | Class selector `3fr` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1098 | Class selector `notes-grid` is declared more than once | first declared on line 809 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1098 | Class selector `result-view` is declared more than once | first declared on line 1094 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1104 | Class selector `workspace` is declared more than once | first declared on line 223 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1108 | Class selector `detail-card` is declared more than once | first declared on line 502 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1108 | Class selector `card` is declared more than once | first declared on line 897 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1115 | Class selector `detail-panel` is declared more than once | first declared on line 497 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1115 | Class selector `workspace` is declared more than once | first declared on line 1104 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1119 | Class selector `has-selection` is declared more than once | first declared on line 1115 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1119 | Class selector `student-board` is declared more than once | first declared on line 231 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1119 | Class selector `workspace` is declared more than once | first declared on line 1115 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1123 | Class selector `detail-close` is declared more than once | first declared on line 543 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1129 | Class selector `detail-close-label` is declared more than once | first declared on line 566 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1135 | Class selector `results-head` is declared more than once | first declared on line 15 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1139 | Class selector `term-picker` is declared more than once | first declared on line 64 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1145 | Class selector `student-grid` is declared more than once | first declared on line 301 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1149 | Class selector `pick` is declared more than once | first declared on line 308 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1149 | Class selector `student-card` is declared more than once | first declared on line 308 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1153 | Class selector `save-btn` is declared more than once | first declared on line 881 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1166 | Class selector `workspace` is declared more than once | first declared on line 1119 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1174 | Class selector `workspace` is declared more than once | first declared on line 1166 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1174 | Class selector `detail-panel` is declared more than once | first declared on line 1115 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1174 | Class selector `has-audit` is declared more than once | first declared on line 1166 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1178 | Class selector `has-audit` is declared more than once | first declared on line 1174 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1178 | Class selector `workspace` is declared more than once | first declared on line 1174 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1182 | Class selector `has-audit` is declared more than once | first declared on line 1178 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1182 | Class selector `workspace` is declared more than once | first declared on line 1178 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1182 | Class selector `student-board` is declared more than once | first declared on line 1119 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1188 | Class selector `workspace` is declared more than once | first declared on line 1182 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1188 | Class selector `has-audit` is declared more than once | first declared on line 1182 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1196 | Class selector `student-board` is declared more than once | first declared on line 1182 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1196 | Class selector `workspace` is declared more than once | first declared on line 1188 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1196 | Class selector `has-audit` is declared more than once | first declared on line 1188 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1202 | Class selector `has-audit` is declared more than once | first declared on line 1196 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1202 | Class selector `workspace` is declared more than once | first declared on line 1196 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1202 | Class selector `card` is declared more than once | first declared on line 1108 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1202 | Class selector `detail-card` is declared more than once | first declared on line 1108 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1210 | Class selector `has-audit` is declared more than once | first declared on line 1202 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1210 | Class selector `workspace` is declared more than once | first declared on line 1202 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1213 | Class selector `detail-panel` is declared more than once | first declared on line 1174 |
| warning | medium | styles.duplicate-selectors | src/app/features/results/term-results.page.scss:1215 | Class selector `student-board` is declared more than once | first declared on line 1196 |
| warning | medium | angular.unused-template-refs | src/app/features/results/term-results.page.ts:57 | #detailPanel is never referenced in this template | template reference is declared but not read |
| warning | medium | subscriptions.teardown | src/app/features/results/term-results.page.ts:308 | Subscription in `TermResultsPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/features/results/term-results.page.ts:390 | Subscription in `TermResultsPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | tool.jscpd | src/app/features/reviews/reviews.page.ts:133 | Copy-paste clone with `src\app\features\reviews\reviews.page.ts`:141 | jscpd: 6 lines, 57 tokens |
| warning | medium | subscriptions.teardown | src/app/features/reviews/reviews.page.ts:170 | Subscription in `ReviewsPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/features/reviews/reviews.page.ts:190 | Subscription in `ReviewsPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/features/reviews/reviews.page.ts:194 | Subscription in `ReviewsPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | clone.type2 | src/app/features/reviews/reviews.routes.ts:1 | Type-2 (renamed) clone: src/app/features/reviews/reviews.routes.ts shares 37 normalized token block(s) with src/app/features/scoring/scoring.routes.ts | Type-2 (renamed) clone: 40 tokens, 37 shared blocks |
| warning | medium | angular.dead-routes | src/app/features/reviews/reviews.routes.ts:6 | Route `` points at a lazy target that does not resolve | ./reviews.page |
| info | medium | git.churn-hotspot | src/app/features/scoring/scoring.page.html:1 | Churn hotspot: 19 changes across 794 LOC (score 183) | git churn × function complexity |
| warning | medium | tool.jscpd | src/app/features/scoring/scoring.page.html:82 | Copy-paste clone with `src\app\features\scoring\scoring.page.html`:483 | jscpd: 14 lines, 56 tokens |
| warning | medium | tool.jscpd | src/app/features/scoring/scoring.page.html:566 | Copy-paste clone with `src\app\features\scoring\scoring.page.html`:592 | jscpd: 11 lines, 56 tokens |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:11 | Class selector `4vw` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:37 | Class selector `4vw` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:37 | Class selector `4vw` is declared more than once | first declared on line 11 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:41 | Class selector `head-icon` is declared more than once | first declared on line 14 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:48 | Class selector `head-icon` is declared more than once | first declared on line 41 |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:58 | Class selector `5rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:58 | Class selector `1vw` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:58 | Class selector `2rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:59 | Class selector `15` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:60 | Class selector `015em` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:68 | Class selector `45` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:157 | Class selector `ring-track` is declared more than once | first declared on line 151 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:161 | Class selector `ring-fill` is declared more than once | first declared on line 152 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:167 | Class selector `ring-fill` is declared more than once | first declared on line 161 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:167 | Class selector `bad` is declared more than once | first declared on line 128 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:167 | Class selector `score-card` is declared more than once | first declared on line 94 |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:179 | Class selector `7vw` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:179 | Class selector `45rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:179 | Class selector `25rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:179 | Class selector `8rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:204 | Class selector `055em` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:210 | Class selector `2rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:210 | Class selector `35vw` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:210 | Class selector `9rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:210 | Class selector `2rem` is declared more than once | first declared on line 58 |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:212 | Class selector `35` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:215 | Class selector `score-state` is declared more than once | first declared on line 208 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:215 | Class selector `score-card` is declared more than once | first declared on line 167 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:215 | Class selector `bad` is declared more than once | first declared on line 167 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:238 | Class selector `stat` is declared more than once | first declared on line 230 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:243 | Class selector `stat-ico` is declared more than once | first declared on line 15 |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:265 | Class selector `25` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:272 | Class selector `15rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:272 | Class selector `55vw` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:272 | Class selector `5rem` is declared more than once | first declared on line 58 |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:272 | Class selector `5rem` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:273 | Class selector `08` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:306 | Class selector `scope-ico` is declared more than once | first declared on line 16 |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:322 | Class selector `45` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:322 | Class selector `45` is declared more than once | first declared on line 68 |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:341 | Class selector `7vw` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:341 | Class selector `7vw` is declared more than once | first declared on line 179 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:434 | Class selector `filter-search` is declared more than once | first declared on line 415 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:594 | Class selector `panel-ico` is declared more than once | first declared on line 17 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:618 | Class selector `3` is declared more than once | first declared on line 426 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:677 | Class selector `scoring-table` is declared more than once | first declared on line 670 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:681 | Class selector `scoring-table` is declared more than once | first declared on line 677 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:685 | Class selector `scoring-table` is declared more than once | first declared on line 681 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:689 | Class selector `scoring-table` is declared more than once | first declared on line 685 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:690 | Class selector `scoring-table` is declared more than once | first declared on line 689 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:694 | Class selector `scoring-table` is declared more than once | first declared on line 690 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:698 | Class selector `scoring-table` is declared more than once | first declared on line 694 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:699 | Class selector `scoring-table` is declared more than once | first declared on line 698 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:706 | Class selector `scoring-table` is declared more than once | first declared on line 699 |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:711 | Class selector `035em` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:716 | Class selector `scoring-table` is declared more than once | first declared on line 706 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:717 | Class selector `scoring-table` is declared more than once | first declared on line 716 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:721 | Class selector `scoring-table` is declared more than once | first declared on line 717 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:746 | Class selector `is-override` is declared more than once | first declared on line 722 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:746 | Class selector `scoring-table` is declared more than once | first declared on line 721 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:783 | Class selector `subject-copy` is declared more than once | first declared on line 726 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:793 | Class selector `3` is declared more than once | first declared on line 618 |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:816 | Class selector `5` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:835 | Class selector `5` is declared more than once | first declared on line 816 |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:835 | Class selector `5` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:859 | Class selector `murajaa` is declared more than once | first declared on line 778 |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:870 | Class selector `5px` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:917 | Class selector `switch-track` is declared more than once | first declared on line 913 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:921 | Class selector `switch-track` is declared more than once | first declared on line 917 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:926 | Class selector `switch-track` is declared more than once | first declared on line 921 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:984 | Class selector `modal-ico` is declared more than once | first declared on line 18 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1002 | Class selector `25` is declared more than once | first declared on line 265 |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:1002 | Class selector `25` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:1009 | Class selector `45` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1009 | Class selector `45` is declared more than once | first declared on line 322 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1038 | Class selector `crumb-separator` is declared more than once | first declared on line 472 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1042 | Class selector `switch` is declared more than once | first declared on line 891 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1042 | Class selector `switch-track` is declared more than once | first declared on line 926 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1046 | Class selector `scoring-table` is declared more than once | first declared on line 746 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1046 | Class selector `is-override` is declared more than once | first declared on line 746 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1054 | Class selector `filter-grid` is declared more than once | first declared on line 401 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1058 | Class selector `filter-search` is declared more than once | first declared on line 434 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1059 | Class selector `filter-center` is declared more than once | first declared on line 416 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1065 | Class selector `modal-grid` is declared more than once | first declared on line 1020 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1071 | Class selector `score-card` is declared more than once | first declared on line 215 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1075 | Class selector `stat` is declared more than once | first declared on line 238 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1079 | Class selector `panel-head` is declared more than once | first declared on line 579 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1085 | Class selector `filter-grid` is declared more than once | first declared on line 1054 |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:1086 | Class selector `7fr` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1089 | Class selector `filter-grid` is declared more than once | first declared on line 1085 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1090 | Class selector `7fr` is declared more than once | first declared on line 1086 |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:1090 | Class selector `7fr` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1093 | Class selector `filter-search` is declared more than once | first declared on line 1058 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1094 | Class selector `filter-center` is declared more than once | first declared on line 1059 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1098 | Class selector `overview` is declared more than once | first declared on line 87 |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:1099 | Class selector `35fr` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1102 | Class selector `stats-card` is declared more than once | first declared on line 219 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1106 | Class selector `stat` is declared more than once | first declared on line 1075 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1110 | Class selector `stat-ico` is declared more than once | first declared on line 243 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1121 | Class selector `scoring-head` is declared more than once | first declared on line 28 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1125 | Class selector `scoring-panel` is declared more than once | first declared on line 571 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1133 | Class selector `panel-head` is declared more than once | first declared on line 1079 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1142 | Class selector `save-btn` is declared more than once | first declared on line 651 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1146 | Class selector `table-responsive` is declared more than once | first declared on line 664 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1150 | Class selector `scoring-table` is declared more than once | first declared on line 1046 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1156 | Class selector `scoring-table` is declared more than once | first declared on line 1150 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1167 | Class selector `cards` is declared more than once | first declared on line 1160 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1178 | Class selector `cards` is declared more than once | first declared on line 1167 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1186 | Class selector `cards` is declared more than once | first declared on line 1178 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1197 | Class selector `035em` is declared more than once | first declared on line 711 |
| warning | medium | styles.unused-selectors | src/app/features/scoring/scoring.page.scss:1197 | Class selector `035em` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1198 | Class selector `2` is declared more than once | first declared on line 611 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1202 | Class selector `subject-cell` is declared more than once | first declared on line 750 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1202 | Class selector `cards` is declared more than once | first declared on line 1186 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1210 | Class selector `subject-cell` is declared more than once | first declared on line 1202 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1210 | Class selector `cards` is declared more than once | first declared on line 1202 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1211 | Class selector `cards` is declared more than once | first declared on line 1210 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1211 | Class selector `actions-cell` is declared more than once | first declared on line 717 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1215 | Class selector `cards` is declared more than once | first declared on line 1211 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1219 | Class selector `cards` is declared more than once | first declared on line 1215 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1223 | Class selector `actions-cell` is declared more than once | first declared on line 1211 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1223 | Class selector `cards` is declared more than once | first declared on line 1219 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1231 | Class selector `actions-cell` is declared more than once | first declared on line 1223 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1231 | Class selector `cards` is declared more than once | first declared on line 1223 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1238 | Class selector `is-arming-delete` is declared more than once | first declared on line 1231 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1238 | Class selector `cards` is declared more than once | first declared on line 1231 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1238 | Class selector `delete-confirm` is declared more than once | first declared on line 952 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1243 | Class selector `subject-copy` is declared more than once | first declared on line 783 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1249 | Class selector `scope-pill` is declared more than once | first declared on line 848 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1253 | Class selector `cards` is declared more than once | first declared on line 1238 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1253 | Class selector `is-override` is declared more than once | first declared on line 1046 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1257 | Class selector `modal-head` is declared more than once | first declared on line 975 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1261 | Class selector `modal-form` is declared more than once | first declared on line 1013 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1265 | Class selector `modal-actions` is declared more than once | first declared on line 1026 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1265 | Class selector `btn` is declared more than once | first declared on line 331 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1269 | Class selector `trail` is declared more than once | first declared on line 441 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1277 | Class selector `panel-actions` is declared more than once | first declared on line 622 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1284 | Class selector `head-icon` is declared more than once | first declared on line 48 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1295 | Class selector `add-btn` is declared more than once | first declared on line 72 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1305 | Class selector `score-card` is declared more than once | first declared on line 1071 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1311 | Class selector `score-ring` is declared more than once | first declared on line 134 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1316 | Class selector `stat` is declared more than once | first declared on line 1106 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1323 | Class selector `stat-ico` is declared more than once | first declared on line 1110 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1328 | Class selector `stat-copy` is declared more than once | first declared on line 254 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1336 | Class selector `trail` is declared more than once | first declared on line 1269 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1341 | Class selector `crumb-separator` is declared more than once | first declared on line 1038 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1345 | Class selector `trail-root` is declared more than once | first declared on line 455 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1349 | Class selector `crumb` is declared more than once | first declared on line 479 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1354 | Class selector `crumb-label` is declared more than once | first declared on line 514 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1358 | Class selector `panel-head` is declared more than once | first declared on line 1133 |
| warning | medium | styles.duplicate-selectors | src/app/features/scoring/scoring.page.scss:1362 | Class selector `unsaved-chip` is declared more than once | first declared on line 630 |
| warning | medium | angular.unused-template-refs | src/app/features/scoring/scoring.page.ts:61 | #centerPicker is never referenced in this template | template reference is declared but not read |
| warning | medium | angular.unused-template-refs | src/app/features/scoring/scoring.page.ts:61 | #scopePicker is never referenced in this template | template reference is declared but not read |
| warning | medium | angular.unused-template-refs | src/app/features/scoring/scoring.page.ts:61 | #statusPicker is never referenced in this template | template reference is declared but not read |
| warning | medium | subscriptions.teardown | src/app/features/scoring/scoring.page.ts:173 | Subscription in `ScoringPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/features/scoring/scoring.page.ts:338 | Subscription in `ScoringPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | tool.jscpd | src/app/features/scoring/scoring.page.ts:341 | Copy-paste clone with `src\app\features\scoring\scoring.page.ts`:416 | jscpd: 9 lines, 55 tokens |
| warning | medium | subscriptions.teardown | src/app/features/scoring/scoring.page.ts:362 | Subscription in `ScoringPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/features/scoring/scoring.page.ts:396 | Subscription in `ScoringPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | angular.dead-routes | src/app/features/scoring/scoring.routes.ts:6 | Route `` points at a lazy target that does not resolve | ./scoring.page |
| warning | medium | tool.jscpd | src/app/features/settings/settings.page.html:566 | Copy-paste clone with `src\app\features\settings\settings.page.html`:857 | jscpd: 22 lines, 85 tokens |
| warning | medium | tool.jscpd | src/app/features/settings/settings.page.html:569 | Copy-paste clone with `src\app\features\settings\settings.page.html`:762 | jscpd: 16 lines, 59 tokens |
| warning | medium | tool.jscpd | src/app/features/settings/settings.page.html:856 | Copy-paste clone with `src\app\features\settings\settings.page.html`:963 | jscpd: 23 lines, 90 tokens |
| warning | medium | tool.jscpd | src/app/features/settings/settings.page.html:1124 | Copy-paste clone with `src\app\features\settings\settings.page.html`:1160 | jscpd: 34 lines, 256 tokens |
| warning | medium | tool.jscpd | src/app/features/settings/settings.page.scss:17 | Copy-paste clone with `src\app\features\settings\settings.page.scss`:429 | jscpd: 31 lines, 213 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:73 | Class selector `tab-panel` is declared more than once | first declared on line 47 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:77 | Class selector `settings-tab` is declared more than once | first declared on line 15 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:83 | Class selector `settings-tabs` is declared more than once | first declared on line 4 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:87 | Class selector `settings-tab` is declared more than once | first declared on line 77 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:116 | Class selector `check` is declared more than once | first declared on line 93 |
| warning | medium | tool.jscpd | src/app/features/settings/settings.page.scss:141 | Copy-paste clone with `src\app\features\settings\settings.page.scss`:347 | jscpd: 16 lines, 125 tokens |
| warning | medium | styles.unused-selectors | src/app/features/settings/settings.page.scss:144 | Class selector `5px` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/settings/settings.page.scss:159 | Class selector `6` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:211 | Class selector `preview` is declared more than once | first declared on line 178 |
| warning | medium | styles.unused-selectors | src/app/features/settings/settings.page.scss:265 | Class selector `55` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:268 | Class selector `disabled` is declared more than once | first declared on line 264 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:278 | Class selector `status` is declared more than once | first declared on line 273 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:310 | Class selector `control-label` is declared more than once | first declared on line 134 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:338 | Class selector `5px` is declared more than once | first declared on line 144 |
| warning | medium | styles.unused-selectors | src/app/features/settings/settings.page.scss:338 | Class selector `5px` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | tool.jscpd | src/app/features/settings/settings.page.scss:346 | Copy-paste clone with `src\app\features\settings\settings.page.scss`:377 | jscpd: 11 lines, 94 tokens |
| warning | medium | styles.unused-selectors | src/app/features/settings/settings.page.scss:350 | Class selector `5px` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:350 | Class selector `5px` is declared more than once | first declared on line 338 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:381 | Class selector `5px` is declared more than once | first declared on line 350 |
| warning | medium | styles.unused-selectors | src/app/features/settings/settings.page.scss:381 | Class selector `5px` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:447 | Class selector `active` is declared more than once | first declared on line 35 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:470 | Class selector `appearance-controls` is declared more than once | first declared on line 284 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:532 | Class selector `device-screen` is declared more than once | first declared on line 521 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:532 | Class selector `device` is declared more than once | first declared on line 508 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:545 | Class selector `p-scene` is declared more than once | first declared on line 537 |
| warning | medium | styles.unused-selectors | src/app/features/settings/settings.page.scss:546 | Class selector `111` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/settings/settings.page.scss:568 | Class selector `5` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:607 | Class selector `p-pattern` is declared more than once | first declared on line 600 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:607 | Class selector `default` is declared more than once | first declared on line 199 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:632 | Class selector `p-ui` is declared more than once | first declared on line 611 |
| warning | medium | styles.unused-selectors | src/app/features/settings/settings.page.scss:653 | Class selector `35` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:657 | Class selector `p-ui` is declared more than once | first declared on line 632 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:657 | Class selector `device` is declared more than once | first declared on line 532 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:657 | Class selector `phone` is declared more than once | first declared on line 532 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:661 | Class selector `p-ui` is declared more than once | first declared on line 657 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:661 | Class selector `phone` is declared more than once | first declared on line 657 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:661 | Class selector `device` is declared more than once | first declared on line 657 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:684 | Class selector `55` is declared more than once | first declared on line 265 |
| warning | medium | styles.unused-selectors | src/app/features/settings/settings.page.scss:684 | Class selector `55` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:727 | Class selector `segment` is declared more than once | first declared on line 426 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:728 | Class selector `settings-toast` is declared more than once | first declared on line 695 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:755 | Class selector `ok` is declared more than once | first declared on line 278 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:767 | Class selector `appearance-savebar` is declared more than once | first declared on line 742 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:767 | Class selector `savebar-msg` is declared more than once | first declared on line 761 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:767 | Class selector `ok` is declared more than once | first declared on line 755 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:776 | Class selector `control` is declared more than once | first declared on line 300 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:798 | Class selector `pv-col` is declared more than once | first declared on line 791 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:803 | Class selector `work` is declared more than once | first declared on line 783 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:807 | Class selector `pv-col` is declared more than once | first declared on line 798 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:814 | Class selector `preview-grid` is declared more than once | first declared on line 501 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:814 | Class selector `pv-col` is declared more than once | first declared on line 807 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:818 | Class selector `phone` is declared more than once | first declared on line 661 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:818 | Class selector `device` is declared more than once | first declared on line 661 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:818 | Class selector `pv-col` is declared more than once | first declared on line 814 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:907 | Class selector `layer-chev` is declared more than once | first declared on line 899 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:907 | Class selector `layer` is declared more than once | first declared on line 826 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:1035 | Class selector `appearance-item` is declared more than once | first declared on line 169 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:1039 | Class selector `preview` is declared more than once | first declared on line 211 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:1043 | Class selector `preview-grid` is declared more than once | first declared on line 814 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:1047 | Class selector `phone` is declared more than once | first declared on line 818 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:1047 | Class selector `device` is declared more than once | first declared on line 818 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:1053 | Class selector `gradient-block` is declared more than once | first declared on line 477 |
| warning | medium | styles.duplicate-selectors | src/app/features/settings/settings.page.scss:1057 | Class selector `layout-grid` is declared more than once | first declared on line 295 |
| warning | medium | tool.jscpd | src/app/features/settings/settings.page.spec.ts:183 | Copy-paste clone with `src\app\features\settings\settings.page.spec.ts`:207 | jscpd: 8 lines, 59 tokens |
| warning | medium | tool.jscpd | src/app/features/settings/settings.page.spec.ts:183 | Copy-paste clone with `src\app\features\settings\settings.page.spec.ts`:253 | jscpd: 11 lines, 82 tokens |
| warning | medium | tool.jscpd | src/app/features/settings/settings.page.spec.ts:183 | Copy-paste clone with `src\app\features\settings\settings.page.spec.ts`:306 | jscpd: 10 lines, 64 tokens |
| warning | medium | tool.jscpd | src/app/features/settings/settings.page.spec.ts:184 | Copy-paste clone with `src\app\features\settings\settings.page.spec.ts`:254 | jscpd: 11 lines, 72 tokens |
| warning | medium | angular.dead-routes | src/app/features/settings/settings.routes.ts:5 | Route `` points at a lazy target that does not resolve | ./settings.page |
| info | medium | git.churn-hotspot | src/app/features/students/student-detail.page.html:1 | Churn hotspot: 14 changes across 353 LOC (score 119) | git churn × function complexity |
| warning | medium | tool.jscpd | src/app/features/students/student-detail.page.html:240 | Copy-paste clone with `src\app\features\students\student-detail.page.html`:312 | jscpd: 12 lines, 66 tokens |
| warning | medium | tool.jscpd | src/app/features/students/student-detail.page.scss:3 | Copy-paste clone with `src\app\styles\_cards.scss`:9 | jscpd: 8 lines, 51 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/students/student-detail.page.scss:30 | Class selector `assign-card` is declared more than once | first declared on line 2 |
| warning | medium | tool.jscpd | src/app/features/students/student-detail.page.spec.ts:115 | Copy-paste clone with `src\app\features\students\student-detail.page.spec.ts`:552 | jscpd: 20 lines, 122 tokens |
| warning | medium | tool.jscpd | src/app/features/students/student-detail.page.spec.ts:115 | Copy-paste clone with `src\app\features\students\student-detail.page.spec.ts`:239 | jscpd: 22 lines, 137 tokens |
| warning | medium | tool.jscpd | src/app/features/students/student-detail.page.spec.ts:141 | Copy-paste clone with `src\app\features\students\student-detail.page.spec.ts`:285 | jscpd: 13 lines, 115 tokens |
| warning | medium | tool.jscpd | src/app/features/students/student-detail.page.spec.ts:239 | Copy-paste clone with `src\app\features\students\student-detail.page.spec.ts`:372 | jscpd: 18 lines, 106 tokens |
| warning | medium | tool.jscpd | src/app/features/students/student-detail.page.spec.ts:258 | Copy-paste clone with `src\app\features\students\student-detail.page.spec.ts`:397 | jscpd: 6 lines, 50 tokens |
| warning | medium | tool.jscpd | src/app/features/students/student-detail.page.spec.ts:436 | Copy-paste clone with `src\app\features\students\student-detail.page.spec.ts`:488 | jscpd: 8 lines, 80 tokens |
| warning | medium | tool.jscpd | src/app/features/students/student-detail.page.spec.ts:447 | Copy-paste clone with `src\app\features\students\student-detail.page.spec.ts`:495 | jscpd: 7 lines, 56 tokens |
| warning | medium | tool.jscpd | src/app/features/students/student-detail.page.spec.ts:467 | Copy-paste clone with `src\app\features\students\student-detail.page.spec.ts`:531 | jscpd: 8 lines, 72 tokens |
| info | medium | git.churn-hotspot | src/app/features/students/student-detail.page.ts:1 | Churn hotspot: 16 changes across 502 LOC (score 144) | git churn × function complexity |
| warning | medium | tool.jscpd | src/app/features/students/student-detail.page.ts:146 | Copy-paste clone with `src\app\features\students\student-detail.page.ts`:154 | jscpd: 6 lines, 68 tokens |
| warning | medium | subscriptions.teardown | src/app/features/students/student-detail.page.ts:458 | Subscription in `StudentDetailPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | subscriptions.teardown | src/app/features/students/student-detail.page.ts:492 | Subscription in `StudentDetailPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | styles.duplicate-selectors | src/app/features/students/students-list.page.scss:19 | Class selector `students-table` is declared more than once | first declared on line 13 |
| warning | medium | styles.duplicate-selectors | src/app/features/students/students-list.page.scss:20 | Class selector `students-table` is declared more than once | first declared on line 19 |
| warning | medium | styles.duplicate-selectors | src/app/features/students/students-list.page.scss:27 | Class selector `students-table` is declared more than once | first declared on line 20 |
| warning | medium | styles.duplicate-selectors | src/app/features/students/students-list.page.scss:37 | Class selector `students-table` is declared more than once | first declared on line 27 |
| warning | medium | styles.duplicate-selectors | src/app/features/students/students-list.page.scss:42 | Class selector `students-table` is declared more than once | first declared on line 37 |
| warning | medium | styles.duplicate-selectors | src/app/features/students/students-list.page.scss:94 | Class selector `cell-name` is declared more than once | first declared on line 56 |
| warning | medium | tool.jscpd | src/app/features/students/students-list.page.ts:108 | Copy-paste clone with `src\app\features\users\users-list.page.ts`:99 | jscpd: 6 lines, 54 tokens |
| warning | medium | angular.dead-routes | src/app/features/students/students.routes.ts:9 | Route `` points at a lazy target that does not resolve | ./students-list.page |
| warning | medium | angular.dead-routes | src/app/features/students/students.routes.ts:15 | Route `new` points at a lazy target that does not resolve | ./student-detail.page |
| warning | medium | angular.dead-routes | src/app/features/students/students.routes.ts:25 | Route `:id` points at a lazy target that does not resolve | ./student-detail.page |
| warning | medium | tool.jscpd | src/app/features/users/user-detail.page.html:1 | Copy-paste clone with `src\app\features\users\user-replace.page.html`:1 | jscpd: 9 lines, 63 tokens |
| warning | high | structure.explicit-any | src/app/features/users/user-detail.page.ts:78 | Explicit `any` weakens type safety | /** Dirty guard: any unsaved edit blocks route leave (confirmed inline). */ |
| warning | medium | subscriptions.teardown | src/app/features/users/user-replace.page.ts:113 | Subscription in `UserReplacePage` has no detected teardown | no matching teardown found in this class |
| info | medium | git.churn-hotspot | src/app/features/users/users-list.page.html:1 | Churn hotspot: 15 changes across 203 LOC (score 115) | git churn × function complexity |
| warning | medium | styles.duplicate-selectors | src/app/features/users/users-list.page.scss:17 | Class selector `row-actions` is declared more than once | first declared on line 8 |
| warning | medium | styles.duplicate-selectors | src/app/features/users/users-list.page.scss:24 | Class selector `row-actions` is declared more than once | first declared on line 17 |
| warning | medium | styles.duplicate-selectors | src/app/features/users/users-list.page.scss:58 | Class selector `user-link` is declared more than once | first declared on line 43 |
| warning | medium | styles.hardcoded-colors | src/app/features/users/users-list.page.scss:68 | Hardcoded color `#fff` is used instead of a token | hex color literal |
| warning | medium | tool.jscpd | src/app/features/users/users-list.page.scss:77 | Copy-paste clone with `src\app\features\users\users-list.page.scss`:112 | jscpd: 7 lines, 75 tokens |
| warning | medium | styles.duplicate-selectors | src/app/features/users/users-list.page.scss:87 | Class selector `role-badge` is declared more than once | first declared on line 77 |
| warning | medium | styles.unused-selectors | src/app/features/users/users-list.page.scss:87 | Class selector `role-badge.admin` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.unused-selectors | src/app/features/users/users-list.page.scss:92 | Class selector `role-badge.supervisor` is not matched by any analyzed template | static classes and class bindings were considered · dynamic class construction is not provable |
| warning | medium | styles.duplicate-selectors | src/app/features/users/users-list.page.scss:92 | Class selector `role-badge` is declared more than once | first declared on line 87 |
| warning | medium | styles.duplicate-selectors | src/app/features/users/users-list.page.scss:97 | Class selector `role-badge` is declared more than once | first declared on line 92 |
| warning | medium | styles.duplicate-selectors | src/app/features/users/users-list.page.scss:102 | Class selector `role-badge` is declared more than once | first declared on line 97 |
| warning | medium | styles.duplicate-selectors | src/app/features/users/users-list.page.scss:107 | Class selector `role-badge` is declared more than once | first declared on line 102 |
| warning | medium | styles.duplicate-selectors | src/app/features/users/users-list.page.scss:121 | Class selector `status-badge` is declared more than once | first declared on line 112 |
| warning | medium | styles.duplicate-selectors | src/app/features/users/users-list.page.scss:126 | Class selector `status-badge` is declared more than once | first declared on line 121 |
| warning | medium | styles.duplicate-selectors | src/app/features/users/users-list.page.scss:131 | Class selector `status-badge` is declared more than once | first declared on line 126 |
| warning | medium | styles.duplicate-selectors | src/app/features/users/users-list.page.scss:136 | Class selector `btn-sm` is declared more than once | first declared on line 24 |
| warning | medium | styles.duplicate-selectors | src/app/features/users/users-list.page.scss:144 | Class selector `btn-sm` is declared more than once | first declared on line 136 |
| warning | medium | styles.duplicate-selectors | src/app/features/users/users-list.page.scss:163 | Class selector `avatar-sm` is declared more than once | first declared on line 63 |
| warning | medium | subscriptions.teardown | src/app/features/users/users-list.page.ts:178 | Subscription in `UsersListPage` has no detected teardown | no matching teardown found in this class |
| warning | medium | angular.dead-routes | src/app/features/users/users.routes.ts:6 | Route `` points at a lazy target that does not resolve | ./users-list.page |
| warning | medium | angular.dead-routes | src/app/features/users/users.routes.ts:13 | Route `:id/replace` points at a lazy target that does not resolve | ./user-replace.page |
| warning | medium | angular.dead-routes | src/app/features/users/users.routes.ts:20 | Route `:id` points at a lazy target that does not resolve | ./user-detail.page |
| warning | high | dead.unused-private-members | src/app/shared/ui/chart/chart.component.ts:73 | TS6133: 'onTheme' is declared but its value is never read. | tsc --noEmit: 'onTheme' is declared but its value is never read. |
| warning | medium | tool.jscpd | src/app/shared/ui/date-picker/date-picker.component.ts:222 | Copy-paste clone with `src\app\shared\ui\dropdown\dropdown.component.ts`:329 | jscpd: 10 lines, 53 tokens |
| warning | medium | styles.duplicate-selectors | src/app/shared/ui/list-table/list-table.component.scss:46 | Class selector `lt-table` is declared more than once | first declared on line 40 |
| warning | medium | styles.duplicate-selectors | src/app/shared/ui/list-table/list-table.component.scss:47 | Class selector `lt-table` is declared more than once | first declared on line 46 |
| warning | medium | styles.duplicate-selectors | src/app/shared/ui/list-table/list-table.component.scss:54 | Class selector `lt-table` is declared more than once | first declared on line 47 |
| warning | medium | tool.jscpd | src/app/shared/ui/list-table/list-table.component.scss:55 | Copy-paste clone with `src\app\shared\ui\list-table\list-table.component.scss`:228 | jscpd: 6 lines, 60 tokens |
| warning | medium | styles.duplicate-selectors | src/app/shared/ui/list-table/list-table.component.scss:64 | Class selector `lt-table` is declared more than once | first declared on line 54 |
| warning | medium | styles.duplicate-selectors | src/app/shared/ui/list-table/list-table.component.scss:73 | Class selector `lt-row` is declared more than once | first declared on line 68 |
| warning | medium | styles.duplicate-selectors | src/app/shared/ui/list-table/list-table.component.scss:160 | Class selector `lt-search` is declared more than once | first declared on line 15 |
| warning | medium | styles.duplicate-selectors | src/app/shared/ui/list-table/list-table.component.scss:167 | Class selector `lt-wrap` is declared more than once | first declared on line 7 |
| warning | medium | styles.duplicate-selectors | src/app/shared/ui/list-table/list-table.component.scss:175 | Class selector `lt-table` is declared more than once | first declared on line 64 |
| warning | medium | styles.duplicate-selectors | src/app/shared/ui/list-table/list-table.component.scss:187 | Class selector `lt-table` is declared more than once | first declared on line 175 |
| warning | medium | styles.duplicate-selectors | src/app/shared/ui/list-table/list-table.component.scss:188 | Class selector `lt-table` is declared more than once | first declared on line 187 |
| warning | medium | styles.duplicate-selectors | src/app/shared/ui/list-table/list-table.component.scss:193 | Class selector `lt-row` is declared more than once | first declared on line 73 |
| warning | medium | styles.duplicate-selectors | src/app/shared/ui/list-table/list-table.component.scss:211 | Class selector `lt-row` is declared more than once | first declared on line 193 |
| warning | medium | styles.duplicate-selectors | src/app/shared/ui/list-table/list-table.component.scss:223 | Class selector `lt-row` is declared more than once | first declared on line 211 |
| warning | medium | styles.duplicate-selectors | src/app/shared/ui/list-table/list-table.component.scss:227 | Class selector `lt-row` is declared more than once | first declared on line 223 |
| warning | medium | tool.jscpd | src/app/shared/ui/list-table/list-table.component.spec.ts:116 | Copy-paste clone with `src\app\shared\ui\list-table\list-table.component.spec.ts`:121 | jscpd: 6 lines, 51 tokens |
| warning | medium | tool.jscpd | src/app/shared/ui/list-table/list-table.component.spec.ts:165 | Copy-paste clone with `src\app\shared\ui\list-table\list-table.component.spec.ts`:193 | jscpd: 6 lines, 57 tokens |
| warning | medium | tool.jscpd | src/app/shared/ui/list-table/list-table.component.spec.ts:165 | Copy-paste clone with `src\app\shared\ui\list-table\list-table.component.spec.ts`:179 | jscpd: 7 lines, 70 tokens |
| warning | medium | dead.unused-exports | src/app/shared/ui/list-table/list-table.component.ts:22 | Exported binding `ListSortDir` is not imported by any analyzed module | no static consumer resolved · dynamic/template/public API usage is not excluded |
| warning | medium | dead.unused-exports | src/app/shared/ui/list-table/list-table.component.ts:30 | Exported binding `ListColumnAlign` is not imported by any analyzed module | no static consumer resolved · dynamic/template/public API usage is not excluded |
| warning | medium | tool.jscpd | src/app/shared/ui/password-field/password-field.component.scss:3 | Copy-paste clone with `src\app\styles\_forms.scss`:4 | jscpd: 7 lines, 52 tokens |
| warning | medium | dead.unused-exports | src/app/shared/ui/status-badge/status-badge.component.ts:4 | Exported binding `BadgeKind` is not imported by any analyzed module | no static consumer resolved · dynamic/template/public API usage is not excluded |
| warning | high | structure.complexity | src/app/shared/ui/thumn-display/thumn-label.ts:17 | Function `sessionAmountLabel` cyclomatic complexity 11 exceeds 10 | cyclomatic=11 · cognitive=10 · loc=13 |
| warning | high | structure.complexity | src/app/shared/ui/thumn-display/thumn-label.ts:40 | Function `weekAmountLabel` cyclomatic complexity 12 exceeds 10 | cyclomatic=12 · cognitive=11 · loc=9 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:163 | Class selector `75rem` is declared more than once | first declared on line 149 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:164 | Class selector `3` is declared more than once | first declared on line 132 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:203 | Class selector `5rem` is declared more than once | first declared on line 162 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:204 | Class selector `25vw` is declared more than once | first declared on line 149 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:204 | Class selector `25rem` is declared more than once | first declared on line 149 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:204 | Class selector `5rem` is declared more than once | first declared on line 203 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:204 | Class selector `75rem` is declared more than once | first declared on line 163 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:212 | Class selector `875rem` is declared more than once | first declared on line 180 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:220 | Class selector `25rem` is declared more than once | first declared on line 204 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:307 | Class selector `875rem` is declared more than once | first declared on line 212 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:334 | Class selector `4` is declared more than once | first declared on line 214 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:334 | Class selector `34` is declared more than once | first declared on line 131 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:340 | Class selector `05` is declared more than once | first declared on line 134 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:348 | Class selector `6` is declared more than once | first declared on line 181 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:355 | Class selector `875rem` is declared more than once | first declared on line 307 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:365 | Class selector `5rem` is declared more than once | first declared on line 204 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:366 | Class selector `875rem` is declared more than once | first declared on line 355 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:410 | Class selector `5rem` is declared more than once | first declared on line 365 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:421 | Class selector `875rem` is declared more than once | first declared on line 366 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:427 | Class selector `auth-form` is declared more than once | first declared on line 217 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_auth.scss:436 | Class selector `22` is declared more than once | first declared on line 250 |
| warning | medium | tool.jscpd | src/app/styles/_buttons.scss:51 | Copy-paste clone with `src\app\styles\_buttons.scss`:84 | jscpd: 11 lines, 55 tokens |
| warning | medium | tool.jscpd | src/app/styles/_calendar.scss:65 | Copy-paste clone with `src\app\styles\_forms.scss`:25 | jscpd: 12 lines, 74 tokens |
| warning | medium | tool.jscpd | src/app/styles/_calendar.scss:72 | Copy-paste clone with `src\app\styles\_forms.scss`:202 | jscpd: 6 lines, 53 tokens |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:90 | Class selector `range-ico` is declared more than once | first declared on line 79 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:136 | Class selector `cal-nav` is declared more than once | first declared on line 129 |
| warning | medium | tool.jscpd | src/app/styles/_calendar.scss:145 | Copy-paste clone with `src\app\styles\_calendar.scss`:329 | jscpd: 6 lines, 56 tokens |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:154 | Class selector `cal-month-view` is declared more than once | first declared on line 141 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:155 | Class selector `cal-month-view` is declared more than once | first declared on line 154 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:156 | Class selector `cal-month-view` is declared more than once | first declared on line 155 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:156 | Class selector `cal-days` is declared more than once | first declared on line 154 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:157 | Class selector `cal-week-view` is declared more than once | first declared on line 142 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:158 | Class selector `cal-day-headers` is declared more than once | first declared on line 157 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:158 | Class selector `cal-week-view` is declared more than once | first declared on line 157 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:159 | Class selector `cal-day-headers` is declared more than once | first declared on line 158 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:159 | Class selector `cal-week-view` is declared more than once | first declared on line 158 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:159 | Class selector `cal-header` is declared more than once | first declared on line 158 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:160 | Class selector `cal-week-view` is declared more than once | first declared on line 159 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:161 | Class selector `cal-week-view` is declared more than once | first declared on line 160 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:162 | Class selector `cal-week-view` is declared more than once | first declared on line 161 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:163 | Class selector `cal-week-view` is declared more than once | first declared on line 162 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:164 | Class selector `cal-hour` is declared more than once | first declared on line 163 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:164 | Class selector `cal-week-view` is declared more than once | first declared on line 163 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:164 | Class selector `cal-hour-segment` is declared more than once | first declared on line 163 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:165 | Class selector `cal-month-view` is declared more than once | first declared on line 156 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:165 | Class selector `cal-day-cell` is declared more than once | first declared on line 155 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:166 | Class selector `cal-day-headers` is declared more than once | first declared on line 159 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:166 | Class selector `cal-week-view` is declared more than once | first declared on line 164 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:166 | Class selector `cal-header` is declared more than once | first declared on line 159 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:167 | Class selector `cal-header` is declared more than once | first declared on line 166 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:167 | Class selector `cal-day-headers` is declared more than once | first declared on line 166 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:167 | Class selector `cal-week-view` is declared more than once | first declared on line 166 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:168 | Class selector `cal-week-view` is declared more than once | first declared on line 167 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:168 | Class selector `cal-day-column` is declared more than once | first declared on line 160 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:173 | Class selector `cal-week-view` is declared more than once | first declared on line 168 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:173 | Class selector `cal-day-headers` is declared more than once | first declared on line 167 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:173 | Class selector `cal-header` is declared more than once | first declared on line 167 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:178 | Class selector `cal-cell-row` is declared more than once | first declared on line 156 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:178 | Class selector `cal-month-view` is declared more than once | first declared on line 165 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:179 | Class selector `cal-cell-row` is declared more than once | first declared on line 178 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:179 | Class selector `cal-month-view` is declared more than once | first declared on line 178 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:180 | Class selector `cal-month-view` is declared more than once | first declared on line 179 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:180 | Class selector `cal-cell` is declared more than once | first declared on line 179 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:181 | Class selector `cal-day-headers` is declared more than once | first declared on line 173 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:181 | Class selector `cal-header` is declared more than once | first declared on line 173 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:181 | Class selector `cal-week-view` is declared more than once | first declared on line 173 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:182 | Class selector `cal-day-headers` is declared more than once | first declared on line 181 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:182 | Class selector `cal-week-view` is declared more than once | first declared on line 181 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:183 | Class selector `cal-time-events` is declared more than once | first declared on line 162 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:183 | Class selector `cal-hour-segment` is declared more than once | first declared on line 164 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:183 | Class selector `cal-week-view` is declared more than once | first declared on line 182 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:184 | Class selector `cal-hour-segment` is declared more than once | first declared on line 183 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:184 | Class selector `cal-drag-over` is declared more than once | first declared on line 182 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:184 | Class selector `cal-week-view` is declared more than once | first declared on line 183 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:188 | Class selector `cal-week-view` is declared more than once | first declared on line 184 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:192 | Class selector `cal-month-view` is declared more than once | first declared on line 180 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:192 | Class selector `cal-day-cell` is declared more than once | first declared on line 165 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:193 | Class selector `cal-header` is declared more than once | first declared on line 181 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:193 | Class selector `cal-week-view` is declared more than once | first declared on line 188 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:197 | Class selector `cal-month-view` is declared more than once | first declared on line 192 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:197 | Class selector `cal-day-cell` is declared more than once | first declared on line 192 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:198 | Class selector `cal-header` is declared more than once | first declared on line 193 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:198 | Class selector `cal-week-view` is declared more than once | first declared on line 193 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:202 | Class selector `cal-week-view` is declared more than once | first declared on line 198 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:203 | Class selector `cal-day-view` is declared more than once | first declared on line 143 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:203 | Class selector `cal-current-time-marker` is declared more than once | first declared on line 202 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:211 | Class selector `cal-month-view` is declared more than once | first declared on line 197 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:212 | Class selector `cal-event` is declared more than once | first declared on line 211 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:212 | Class selector `cal-week-view` is declared more than once | first declared on line 202 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:213 | Class selector `cal-day-view` is declared more than once | first declared on line 203 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:213 | Class selector `cal-event` is declared more than once | first declared on line 212 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:214 | Class selector `cal-month-view` is declared more than once | first declared on line 211 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:214 | Class selector `cal-event` is declared more than once | first declared on line 213 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:222 | Class selector `cal-month-view` is declared more than once | first declared on line 214 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:222 | Class selector `cal-event` is declared more than once | first declared on line 214 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:227 | Class selector `cal-event` is declared more than once | first declared on line 222 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:227 | Class selector `cal-month-view` is declared more than once | first declared on line 222 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:232 | Class selector `cal-month-view` is declared more than once | first declared on line 227 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:232 | Class selector `cal-event` is declared more than once | first declared on line 227 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:237 | Class selector `cal-event` is declared more than once | first declared on line 232 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:238 | Class selector `cal-event` is declared more than once | first declared on line 237 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:242 | Class selector `cal-event` is declared more than once | first declared on line 238 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:242 | Class selector `cal-event.ss-cancelled` is declared more than once | first declared on line 238 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:248 | Class selector `cal-month-view` is declared more than once | first declared on line 232 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:248 | Class selector `cal-event` is declared more than once | first declared on line 242 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:253 | Class selector `cal-month-view` is declared more than once | first declared on line 248 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:263 | Class selector `cal-month-view` is declared more than once | first declared on line 253 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:263 | Class selector `cal-open-day-events` is declared more than once | first declared on line 214 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:269 | Class selector `cal-open-day-events` is declared more than once | first declared on line 263 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:269 | Class selector `cal-month-view` is declared more than once | first declared on line 263 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:277 | Class selector `cal-month-view` is declared more than once | first declared on line 269 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:277 | Class selector `cal-open-day-events` is declared more than once | first declared on line 269 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:277 | Class selector `cal-event-title` is declared more than once | first declared on line 253 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:281 | Class selector `cal-event` is declared more than once | first declared on line 248 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:281 | Class selector `cal-open-day-events` is declared more than once | first declared on line 277 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:281 | Class selector `cal-month-view` is declared more than once | first declared on line 277 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:290 | Class selector `cal-month-view` is declared more than once | first declared on line 281 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:290 | Class selector `cal-open-day-events` is declared more than once | first declared on line 281 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:294 | Class selector `cal-month-view` is declared more than once | first declared on line 290 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:294 | Class selector `cal-open-day-events` is declared more than once | first declared on line 290 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:309 | Class selector `cal-tooltip` is declared more than once | first declared on line 305 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:309 | Class selector `cal-tooltip-arrow` is declared more than once | first declared on line 305 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:313 | Class selector `cal-tooltip` is declared more than once | first declared on line 309 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:313 | Class selector `cal-tooltip-arrow` is declared more than once | first declared on line 309 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:317 | Class selector `cal-tooltip` is declared more than once | first declared on line 313 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:317 | Class selector `cal-tooltip-arrow` is declared more than once | first declared on line 313 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:431 | Class selector `cal-year-day-n` is declared more than once | first declared on line 426 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:462 | Class selector `cal-year` is declared more than once | first declared on line 324 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_calendar.scss:468 | Class selector `cal-year` is declared more than once | first declared on line 462 |
| warning | medium | tool.jscpd | src/app/styles/_cards.scss:3 | Copy-paste clone with `src\app\styles\_cards.scss`:52 | jscpd: 9 lines, 94 tokens |
| warning | medium | tool.jscpd | src/app/styles/_cards.scss:6 | Copy-paste clone with `src\app\styles\_layout.scss`:227 | jscpd: 6 lines, 60 tokens |
| warning | medium | styles.duplicate-selectors | src/app/styles/_cards.scss:43 | Class selector `card` is declared more than once | first declared on line 3 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_cards.scss:47 | Class selector `dd` is declared more than once | first declared on line 43 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_cards.scss:47 | Class selector `dd.open` is declared more than once | first declared on line 43 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_cards.scss:47 | Class selector `card` is declared more than once | first declared on line 43 |
| warning | medium | tool.jscpd | src/app/styles/_cards.scss:98 | Copy-paste clone with `src\app\styles\_forms.scss`:108 | jscpd: 8 lines, 79 tokens |
| warning | medium | styles.duplicate-selectors | src/app/styles/_cards.scss:208 | Class selector `stat-card` is declared more than once | first declared on line 52 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_cards.scss:211 | Class selector `stat-label` is declared more than once | first declared on line 74 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_cards.scss:215 | Class selector `stat-value` is declared more than once | first declared on line 80 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_cards.scss:229 | Class selector `stat-label` is declared more than once | first declared on line 211 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_cards.scss:233 | Class selector `stat-value` is declared more than once | first declared on line 215 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_exam-paper.scss:188 | Class selector `paper-head` is declared more than once | first declared on line 5 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_exam-paper.scss:192 | Class selector `paper-table` is declared more than once | first declared on line 91 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_exam-paper.scss:198 | Class selector `paper-table` is declared more than once | first declared on line 192 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_exam-paper.scss:202 | Class selector `paper-table` is declared more than once | first declared on line 198 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_exam-paper.scss:208 | Class selector `paper-table` is declared more than once | first declared on line 202 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_exam-paper.scss:218 | Class selector `paper-table` is declared more than once | first declared on line 208 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_exam-paper.scss:228 | Class selector `paper-table` is declared more than once | first declared on line 218 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_exam-paper.scss:236 | Class selector `paper-table` is declared more than once | first declared on line 228 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_exam-paper.scss:237 | Class selector `paper-ayah` is declared more than once | first declared on line 136 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_exam-paper.scss:237 | Class selector `paper-table` is declared more than once | first declared on line 236 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_exam-paper.scss:238 | Class selector `paper-table` is declared more than once | first declared on line 237 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_exam-paper.scss:238 | Class selector `paper-score` is declared more than once | first declared on line 157 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_exam-paper.scss:243 | Class selector `paper-table` is declared more than once | first declared on line 238 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_exam-paper.scss:249 | Class selector `paper-table` is declared more than once | first declared on line 243 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_exam-paper.scss:254 | Class selector `paper-ref` is declared more than once | first declared on line 140 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_exam-paper.scss:258 | Class selector `paper-score` is declared more than once | first declared on line 238 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_exam-paper.scss:264 | Class selector `paper-score` is declared more than once | first declared on line 258 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_exam-paper.scss:264 | Class selector `paper-table` is declared more than once | first declared on line 249 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_exam-paper.scss:268 | Class selector `paper-table` is declared more than once | first declared on line 264 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_flatpickr.scss:108 | Class selector `flatpickr-calendar` is declared more than once | first declared on line 8 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_flatpickr.scss:112 | Class selector `flatpickr-time` is declared more than once | first declared on line 108 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_flatpickr.scss:115 | Class selector `numInputWrapper` is declared more than once | first declared on line 46 |
| warning | medium | tool.jscpd | src/app/styles/_forms.scss:16 | Copy-paste clone with `src\app\styles\_forms.scss`:194 | jscpd: 6 lines, 59 tokens |
| warning | medium | styles.duplicate-selectors | src/app/styles/_forms.scss:81 | Class selector `field` is declared more than once | first declared on line 4 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_forms.scss:82 | Class selector `field` is declared more than once | first declared on line 81 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_forms.scss:149 | Class selector `chk` is declared more than once | first declared on line 89 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_forms.scss:167 | Class selector `term-row` is declared more than once | first declared on line 83 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_layout.scss:7 | Class selector `page` is declared more than once | first declared on line 6 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_layout.scss:58 | Class selector `dd` is declared more than once | first declared on line 56 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_layout.scss:58 | Class selector `open` is declared more than once | first declared on line 56 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_layout.scss:72 | Class selector `grid-auto` is declared more than once | first declared on line 64 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_layout.scss:188 | Class selector `card` is declared more than once | first declared on line 56 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_layout.scss:188 | Class selector `open` is declared more than once | first declared on line 58 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_layout.scss:188 | Class selector `dd` is declared more than once | first declared on line 58 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_layout.scss:190 | Class selector `open` is declared more than once | first declared on line 188 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_layout.scss:190 | Class selector `dd` is declared more than once | first declared on line 188 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_print.scss:22 | Class selector `print-sheet` is declared more than once | first declared on line 15 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_print.scss:27 | Class selector `print-sheet` is declared more than once | first declared on line 22 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_print.scss:28 | Class selector `print-sheet` is declared more than once | first declared on line 27 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_print.scss:36 | Class selector `paper-sheet` is declared more than once | first declared on line 35 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_print.scss:37 | Class selector `paper-sheet` is declared more than once | first declared on line 36 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_print.scss:38 | Class selector `paper-sheet` is declared more than once | first declared on line 37 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_print.scss:39 | Class selector `paper-sheet` is declared more than once | first declared on line 38 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_print.scss:43 | Class selector `paper-sheet` is declared more than once | first declared on line 39 |
| warning | medium | styles.duplicate-selectors | src/app/styles/_tables.scss:63 | Class selector `table-wrap` is declared more than once | first declared on line 15 |
| warning | high | dead.unused-locals | src/index.html:19 | Local variable `e` is never read | resolved references: 0 · binding kind: variable · No resolved read reference exists in this file. |
| warning | medium | tool.knip | test/crypto-js-shim.ts:1 | Knip: unlisted dependency `crypto-js` | knip category: unlisted |
| warning | medium | tool.jscpd | tsconfig.app.json:1 | Copy-paste clone with `tsconfig.spec.json`:1 | jscpd: 6 lines, 243 tokens |
| warning | medium | tool.knip | vendor/ng-cryptostore/fesm2022/ng-cryptostore.mjs:1 | Knip: unused file `vendor/ng-cryptostore/fesm2022/ng-cryptostore.mjs` | knip category: files |
| warning | medium | tool.knip | vendor/ng-cryptostore/types/ng-cryptostore.d.ts:1 | Knip: unused file `vendor/ng-cryptostore/types/ng-cryptostore.d.ts` | knip category: files |
| warning | medium | tool.jscpd | vendor/ng-cryptostore/types/ng-cryptostore.d.ts:287 | Copy-paste clone with `vendor\ng-cryptostore\types\ng-cryptostore.d.ts`:418 | jscpd: 6 lines, 63 tokens |
| warning | medium | tool.jscpd | vendor/ng-cryptostore/types/ng-cryptostore.d.ts:304 | Copy-paste clone with `vendor\ng-cryptostore\types\ng-cryptostore.d.ts`:339 | jscpd: 8 lines, 66 tokens |

## Limitations

- Basic export includes findings and selected/excluded coverage; source-debt charts are M7.
