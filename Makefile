PROJ := $(notdir $(shell pwd))
PROJ = $(notdir $(shell pwd))
VERSION := $(shell git describe --exact-match)
VERSIONDATE := $(strip $(shell git log -1 | sed -n -e s/^Date://p))
ifeq ($(VERSION),)
    	$(error current commit is not tagged as a release)
endif

release:
	@sed -e 's/%VERSION%/$(VERSION)/g' -e 's/%VERSIONDATE%/$(VERSIONDATE)/g' $(PROJ).js > $(PROJ)-$(VERSION).js
