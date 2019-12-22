# Pre-Flight - Version 0.1

This file gives you some general information about different topics related to Pre-Flight and lists some links that might be relevant based on your interest.

## What is Pre-Flight?

Pre-flight is a flight planning tool for supporting pilots in automating some steps of the flight planning process. It is based on the concept that the pilot will still drive the process. So the tool does not aim at providing full automation. It serves as a utility to make the process more time-efficient.

Have a look at the architecture documentation in the de.rdnp.preflight.architecture/doc folder in this repository to know more about the use cases and the technical design of Pre-Flight:

    https://github.com/rdnp/pre-flight/blob/master/de.rdnp.preflight.architecture/doc/architecture.md

## How to build and run Pre-Flight on my machine?

### Build from sources
Simply start the maven build within the project de.rdnp.preflight.flightplanner.build with "verify" goal. It will generate and test a jar in the target folder of the de.rdnp.preflight.flightplanner project. This jar can then be run. Once it is up, type 

    http://localhost:8080 

into your browser's address bar.

This application cannot be accessed from other network nodes due to the repository location. If you want a jar that can be accessed by other nodes, you need to first change the repositoryUrl property in environment.prod.ts in de.rdnp.preflight.flightplanner.webui to the node where the Jar will be deployed later. After this, you need to re-run the build.

## How to use Pre-Flight?

Please have a look at the dedicated user documentation in the Wiki on this github project:

    https://github.com/rdnp/pre-flight/wiki

### What if I find a bug?

Please report any bugs to mail@richard-dn-pohl.de

### Why isn't there a running instance of Pre-Flight hosted in the web?

It is planned to bring Pre-Flight into the Web eventually. Currently, the tool is at an early stage of its development is too early to bring it online, especially due to some limitations. For more details, look into the architecture documentation / technical debt session.

Because I develop Pre-Flight in my free time, there is also no fixed release cycle. And it will likely be the case that pre-flight will be developed for a few weeks in a row and after this I will take a break from development for some time.

## How has Pre-Flight been developed?

Please have a look at my blog here to get some insights from the development of Pre-Flight:

    https://rdnpohl.wordpress.com/

## What license is Pre-Flight under?

Pre-Flight is licensed under Apache License, Version 2.0.

## How to contribute changes to Pre-Flight?

Pre-Flight is open source and every useful addition from a pilot's perspective is highly appreciated under the following conditions. I am following a test-driven development approach and I always keep the big picture in mind so that the solution remains maintainable, extensible and reliable. So I expect that any change to Pre-Flight for integration into the main branch (1) provides tests along with the code change so that it's fully tested in an automated way (2) keeps all build scripts intact and (3) enhances or adapts the architecture documentation with useful information whereever that is needed.