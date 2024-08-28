.PHONY: licenses
licenses:
	rm -rf ./licenses.json
	npx license-checker-rseidelsohn --json > ./licenses.json
