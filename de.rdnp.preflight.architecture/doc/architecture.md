# Pre-Flight Architecture Documentation

## 1. Requirements and Goals

The goal of _pre-flight_ is:

* Open source reference architecture clearly documenting all interfaces between flight planning tools and external services, such as weather providers
* Open source tools that can be used to educate people on the functionality of each one of the tools around the flight planning that have been implemented
* Supporting pilots like me in planning VFR and IFR flights correctly and efficiently in a semi-automated manner

From this, the need to support the following quality goals arises:

* Correctness: Especially critical computations must be 100 % correct. All software will be tested with appropriate testing techniques, tests will also be published along with the software.
* Transparency: All computations will be done in a way that the user sees what is happening. For instance, the exact data sources will be mentioned by the software. This is also complementing the open source character of the software.
* Maintainability, Portability and Extensibility: The software will be designed in a way that parts can be easily exchanged and deployed elsewhere.

At a high level, features of the software will include:

1. Planning a flight route in a semi-automated manner using a paper map considering aircraft performance and the weather along the route
1. Managing printouts of approach plates needed for a flight (esp. IFR)
1. Weight and balance computations for airplanes
1. Computing the take off and landing run
1. Creating a weather briefing
1. Planning a flight route in a semi-automated manner using a list of points considering aircraft performance and the weather along the route
1. Route discovery between airports
1. Generating flight plans for filing

## 2. Constraints and Conventions

* The software must be shippable in a first version by end of 2019, this restricts the project capacity to 12 person days
* All tools included must be non-commercial and non-GPL
* All tools produced by the project must be accessible through a web browser with no installation required by the end users

## 3. System Context

![System Context Diagram](Pre-Flight - System Context.png)

## 4. Solution Strategy

The key drivers behind the strategy behind Pre-Flight are:

* Education - Creating of a clearly documented and understandable reference architecture for flight planning tools
* Business value - Automating the most time-consuming activities in the manual flight planning process
* Easy access - All tools are web-apps that are accessible from any system relying only on a web browser
* Transpacency on actions performed and data used by the software to the user so that errors (e.g. invalid / outdated data) can be easily detected
* Modularization - Leaving extension points for further automation (e.g. easy replacement of initially manual inputs by data from web services)

### 4.1 Technology Strategy

To reduce the variation in technology, the entire architecture of Pre-Flight will be composed only of three types of technical building blocks:

* Web-clients, exposing a UI to the user - those are implemented using [Angular](https://angular.io/start). They consume services (including repository services) for accessing and storing data.
* Services, providing business logic behind a REST interface - those are implemented using [Spring RESTful Services](https://spring.io)
* Repository Services, giving access to a contained database through a REST interface  - those are implemented using [Spring Repository for the H2 database](https://spring.io)

![Artifact Types](./pptx-export/Folie2.PNG)

Each building block corresponds to a component in chapter 5. See chapter 8 for details on how each one of those is implemented in detail. For details on why those technologies have been chosen, see chapter 9. 

### 4.2 Test Strategy

Three levels of testing are relevant for the development: 

* Unit testing
* Integration testing of a component
* System testing of a deployable overall product

For unit and component level testing, the following frameworks are used:

* Karma / Jasmine for the WebClient part
* JUnit for the REST interfaces exposed by services

For system level testing, Selenium is used.

The development follows a test-driven approach. This entails that unit tests are created as part of the development process.

For component-level tests, a Mock component is developed in parallel to the counterpart requiring the interface. For example, while developing a web client that requires to use a particular service, the corresponding mock service is developed. The mock services are developed as regular self-contained Spring REST services. The mock clients are developed in JUnit, exploiting the Java interface declaring the REST operation in Spring's code. Mock client and mock service development will be part of the development process of the interfaces.

![Integration Test](./pptx-export/Folie3.PNG)

For system-level tests, Selenium tests are created, one for each use case. This can be started as early as the UI for a use cases is defined, and before the respective business logic is in place.

![System Test](./pptx-export/Folie4.PNG)

### 4.3 Delivery and Deployment Strategy

The project structure and the delivery pipeline is shown below for an example application containing web clients and services.

<img src="./pptx-export/Folie5.PNG" alt="Build Pipeline" width=900/>

Generally, the build process first builds the integration test environment, containing of all mock services needed for testing. The integration test environment is immediately fired up. This way, the services from the test environment can be accessed during the testing phase of the web clients and the services. After this, the web clients are tested and built into HTML, CSS and JavaScript. These artifacts are immediately integrated into the main application project, which is built last. The build output is a deployable JAR file containing the web ui, production services, embedded Tomcat and the embedded database.

After the production artifact is available, the integration test environment is stopped and the production environment is started. The final build step comprises running the system tests against the production environment.

The build is designed as a Maven build, so that it can be easily triggered from Eclipse and from a CI pipeline.

## 5. System Decomposition View

<img src="Pre-Flight - Containers.png" alt="System Decomposition Diagram" width=900/>

### 5.1 Flight Planner

<img src="Pre-Flight - Flight Planning - Components.png" alt="Flight Planner Component Diagram" width=900/>

### 5.2 Approach Plate Manager

<img src="Pre-Flight - Approach Plate Manager - Components.png" alt="Approach Plate Manager Component Diagram"/>

### 5.3 Aircraft Manager

<img src="Pre-Flight - Aircraft Manager - Components.png" alt="Aircraft Manager Component Diagram" width=900/>

## 6. Runtime View

TODO Navigation in App

## 7. Deployment View

TODO Standard deployment out of pipeline

## 8. Cross-Cutting Concepts

### 8.1 Persistence Concept
Persistence is achieved through Spring repository services. Those communicate with the H2 database. This decision is documented in ADR-1.

An example how to implement a repository service for the H2 database can be found here: https://spring.io/guides/gs/accessing-data-jpa/

In addition, the following properties need to be added to an application.properties file of the project in "src/main/resources" folder (create one if needed):

```
spring.datasource.url = jdbc:h2:file:./flightdata/flightdb;DB_CLOSE_ON_EXIT=FALSE;
spring.jpa.hibernate.ddl-auto = update
```

This ensures that the data is written to a file and not discarded on application shutdown.

### 8.2 Service Concept
All services of pre-flight are REST services implemented using the Spring framework and grouped into Spring Applications. 

An example how to implement such a service can be found here: https://spring.io/guides/gs/rest-service/

One extension to this for pre-flight is that each service has an associated test service implementation. The intention is that the test instance is configured to a particular behavior before the test with an API the service provides. The test services are part of a test Spring Application. Each Spring Application has one associated test application, which is a separate Maven module. 

The test application and all test services are configured to support Cross-Domain requests so that the associated web clients and other services can run within a different server on the same node for testing. See this post for how to enable cross-domain requests (CORS): https://stackoverflow.com/questions/35091524/spring-cors-no-access-control-allow-origin-header-is-present

**Important Note**. CORS is not to be enabled on the productive Spring application.

### 8.3 Web Client Concept
All web clients are implemented as part of Angular applications. 

The documentation of Angular can be found here: https://angular.io/start.

### 8.4 Security Concept
TODO This is still open

## 9. Architecture Decision Log

### ADR-1 Persistence Technology - Spring with H2

**Status**. Closed - 2019/12/08

**Context**. Pre-Flight needs to persist data of flight routes, aircraft performance, etc. There are various options available in the context of web applications:
* Many new web-apps use MongoDB. It is easy to install, should be sufficiently fast for the use case and amount of data, and has a strong community.
* Enterprise systems heavily rely on JEE technology with relational databases. Major options there are MySQL, PostgreSQL. Very fast. Need higher effort due to maintenance of schemas and installation.
* H2 database following JEE standard. It can be easily exchanged with another relational DB. It needs no installation, as it can be simply imported from Maven. H2 databases are also heavily used as test database for enterprise applications that rely on relational databases.

**Decision**. The decision is towards the H2 database. The H2 database is most easy to use (no installation), compatible with JEE and sufficient for development, and even for an initial deployment with few users.

**Consequences**. The application will not be able to switch to MongoDB easily if that would be needed for some reason (e.g. higher amount of users). It will be however possible with low effort to reconfigure the application to another relational database for productive deployment. This would then require the set-up of the new database.

### ADR-2 Front-End Technology - Angular
**Status**. Closed - 2019/12/08

**Context**. For the web-clients, a technology needs to be chosen. Options considered are:
* Google Web Toolkit - on the market since long time, in maintenance phase. Allows to code everything in Java with JUnit and generate JavaScript out of that. Less releases in the recent past, so there is a slight risk of outdating. Needs no specific IDE over what is already there for Java.
* Angular JS - very small in size, can be even simply imported in a JavaScript file. Needs no specific installation or IDE. Many applications on the market rely on AngularJS.
* Angular (aka Angular 2) - modern and currently in active development. Allows for responsive design out of the box and has a good structural framework for the code. Supports TypeScript as a language and test-driven development with Jasmine/Karma.
* HTML + CSS + JavaScript with some libraries - classical approach. Most easy to implement. Might make some more complex UIs hard to realize. Risks are that for some features and even ways of working (e.g. TDD) more research is needed.

**Decision**. Angular (aka Angular 2). Reason: Risk of getting outdated in the mid-term future is lowest and most features are available, minimizing the risk associated with additional low-level hacks or dependencies.

**Consequences**. Need to integrate the Angular application into the build process, need to install IDE plug-ins. Overall effort will increase by 3-4 days due to this. However, the benefits of being able to do things more easily later will pay off this initial invest.

### ADR-3 Deployment Format - Spring with Embedded Tomcat

**Status**. Closed - 2019/12/08

**Context**. This is about how to deliver the output of the project, the actual software. Options are the creation of .war files for deployment on a web application server and the use of Spring's embedded Tomcat and deploy one application as a single .jar

**Decision**. Use of Spring's embedded Tomcat, deploy one application as a single .jar.

**Consequences**. When multiple applications are available, this could lead to problems when running them on a single node. Either they need to run on different ports. This means that ports for the services required from other applications must be configurable and every application must be deployable on a different node, not relying on the others. If this is not ensured by the final solution, this decision needs to be revisited. It can be revised to building .war files, as Spring services can be deployed as .war files easily.

## 10. Risks / Technical Debt

### Technical Debt #1 - Architecture Documentation as Part of Build

Description: The architecture documentation needs to be integrated in build pipeline. This way, it is ensured that always the current architecture documentation is exported from the model. In addition, the AD should be checked against the implementation in the model.

Status: New

Risk: Low

Comment: Risk is low as of now, as there is not yet much functionality in the application. Once interfaces become more and functionality is more complex, there will be a need for this.

Date found: 2019/12/07

### Technical Debt #2 - Support of Multiple Applications in Deployment

Description:  Deployment of multiple containers onto one or more nodes need to be defined. One idea could be the use of Docker containers. Another option would be to simply build one .war file for an application. This way, all applications could be deployed onto one web server.

Status: New

Risk: Low

Comment: Risk is low as of now, as there is only one application to be developed in the near future. Also, Spring's website says that building a .war file is easy, so at least one of the solutions will work out with low additional effort. 

Date found: 2019/12/07

### Technical Debt #3 - Modules of the Build are not Independent

Description: Currently, the overall build starts / stops the server at certain points. Best would be to modularize the build, so that every step can be executed without the one before. Especially tests need to start their test environment without user interaction. Currently, in case of some modules, the user needs to manually start the integration test server to run the build.

Status: New

Risk: Low

Comment: Risk is low as of now, as there are only very few components. If the build gets more complex, this could become an issue.

Date found: 2019/12/08

### Technical Debt #4 - Shutdown Hook on Productive Server

Description: There is a shutdown controller exposing a REST interface introduced to shutdown the integration test and production server during the build. While this is very good for the integration test server, it is not advisable for the production server. Either the hook must be removed or secured e.g. that only certain users can trigger it.

Status: New

Risk: High

Comment: Risk is high once the system goes into production as anyone could simply shutdown the service and make the system fail.

Date found: 2019/12/08

### Technical Debt #5 - Duplicate Code between Test Service and Production Service

Description: Currently there are code duplications between the test and production service. As the test service needs to be built first, as it will be used to test the production service, this is not too easy to resolve. A short-term workaround could be a sync script that overrides the source code in the test project with the one from the production project. Better would be to refer the code in some way.

Status: New

Risk: Medium

Comment: Should be resolved at least with a workaround once the implementation of the productive service starts.

Date found: 2019/12/08