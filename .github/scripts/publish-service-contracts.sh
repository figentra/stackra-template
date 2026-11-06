#!/usr/bin/env bash
# Stackra file contract:
# Purpose: publish each service's contract package (Stackra ADR 0511 decisions 1 to 5): for every `services/<name>` with
#          a committed `stackra.manifest.json`, assemble `@figentra/<service-package>-contract` (`stackra.kind`
#          `contract`) from the committed manifest, `openapi.json` and `assets/lang`, nothing else (no source, no maps),
#          at the service's own version, and publish it to the Stackra registry with provenance. A consumer in another
#          repository declares it as a `catalog:` devDependency and gen builds its client from it.
# Boundary: run by release.yml's contracts job (environment `release`, id-token write), which needs no install and
#           no build. No registry token exists: per contract the job exchanges its GitHub ID token (audience
#           `npm:<registry host>`) for a publish token bound to that one name, as the package publish does. A version
#           already on the registry answers 409 (versions are immutable, Stackra ADR 0453 decision 7) and is skipped;
#           a new contract version follows a bump of the service's version. `DRY_RUN=true` assembles and packs every
#           contract and publishes nothing; `SKIP_CONTRACTS` (space-separated service folders) leaves those out.
# Runtime: bash (GitHub Actions runner: jq, curl, pnpm)
# Governing contract: Stackra ADR 0511 (decisions 1 to 6); Stackra ADR 0453 (decisions 6, 7 and 19).
set -euo pipefail

REGISTRY="${REGISTRY:-https://npm.stackra.figentra.com/}"
host="${REGISTRY#https://}"
out="${RUNNER_TEMP:-$(mktemp -d)}/service-contracts"
curl() { command curl --connect-timeout 20 --max-time 90 --retry 4 --retry-delay 5 "$@"; }

if [ "${DRY_RUN:-false}" != true ]; then
  # A reference, not a value: pnpm expands ${NODE_AUTH_TOKEN} from each publish's environment (pnpm 12 ignores a
  # token in a project .npmrc). Appended last, so it wins over the read token Registry auth wrote.
  # shellcheck disable=SC2016 # the literal ${…} is the point
  printf '//%s:_authToken=${NODE_AUTH_TOKEN}\n' "$host" >> ~/.npmrc
fi

for dir in services/*/; do
  dir="${dir%/}"
  [ -f "$dir/stackra.manifest.json" ] && [ -f "$dir/package.json" ] || continue
  # A committed contract that gen no longer reproduces is not published until it is regenerated and its version bumped.
  case " ${SKIP_CONTRACTS:-} " in
    *" ${dir#services/} "*) echo "::warning title=Contract skipped::${dir} (SKIP_CONTRACTS)" && continue ;;
  esac
  service="$(jq -r '.name' "$dir/package.json")"
  version="$(jq -r '.version' "$dir/package.json")"
  name="${service}-contract"
  pkg="$out/${name#@figentra/}"
  rm -rf "$pkg" && mkdir -p "$pkg"
  cp "$dir/stackra.manifest.json" LICENSE "$pkg/"
  files='["stackra.manifest.json","LICENSE"]'
  if [ -f "$dir/openapi.json" ]; then
    cp "$dir/openapi.json" "$pkg/"
    files="$(jq -c '. + ["openapi.json"]' <<<"$files")"
  fi
  if [ -d "$dir/assets/lang" ]; then
    mkdir -p "$pkg/assets" && cp -R "$dir/assets/lang" "$pkg/assets/lang"
    files="$(jq -c '. + ["assets/lang"]' <<<"$files")"
  fi
  jq -n --arg name "$name" --arg version "$version" --arg service "$service" --argjson files "$files" \
    --arg repo "${GITHUB_REPOSITORY:-$(git config --get remote.origin.url | sed -E 's#.*github.com[:/]##; s#\.git$##')}" \
    --arg directory "$dir" --arg registry "$REGISTRY" '{
      name: $name,
      version: $version,
      description: "The service contract of \($service) (Stackra ADR 0511): its stackra.manifest.json, OpenAPI document and lang catalogue, from which a consumer in another repository generates its client. No source.",
      license: "SEE LICENSE IN LICENSE",
      repository: { type: "git", url: "git+https://github.com/\($repo).git", directory: $directory },
      files: $files,
      stackra: { kind: "contract" },
      publishConfig: { registry: $registry }
    }' > "$pkg/package.json"

  if [ "${DRY_RUN:-false}" = true ]; then
    (cd "$pkg" && pnpm pack --dry-run)
    continue
  fi
  encoded="${name/\//%2f}"
  id_token="$(curl -fsS -H "Authorization: bearer ${ACTIONS_ID_TOKEN_REQUEST_TOKEN}" \
    "${ACTIONS_ID_TOKEN_REQUEST_URL}&audience=npm:${host%/}" | jq -r '.value')"
  echo "::add-mask::${id_token}"
  NODE_AUTH_TOKEN="$(curl -fsS -X POST -H "Authorization: Bearer ${id_token}" \
    "${REGISTRY}-/npm/v1/oidc/token/exchange/package/${encoded}" | jq -r '.token')"
  echo "::add-mask::${NODE_AUTH_TOKEN}"
  export NODE_AUTH_TOKEN
  if (cd "$pkg" && pnpm publish --no-git-checks --provenance --registry "$REGISTRY") \
    2>&1 | tee "$out/publish.log"; then
    echo "::notice title=Published::${name}@${version}"
  # pnpm wraps the registry's error over "│ " lines, so match across line breaks.
  elif log="$(<"$out/publish.log")" && grep -Eq 'versions[ │]+are[ │]+immutable' <<<"${log//$'\n'/ }"; then
    echo "skip ${name}@${version}: already on the registry"
  else
    exit 1
  fi
  unset NODE_AUTH_TOKEN
done
