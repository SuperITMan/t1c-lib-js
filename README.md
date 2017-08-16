# Trust1Connector JavaScript Library
[![][t1c-logo]][Trust1Connector-url]

The Trust1Connector library (T1C-Lib), is a javascript library to communicate with the Trust1Connector. The library simplify the execution to the connector and works asynchronous.

When the Trust1Connector isn’t installed the library will download the file automatically. This check returns a small object with some information.

## Community
We're present on Gitter in the following room:
[Trust1Connector-gitter]

## Installation - OSX Only
Make sure you have brew installed on your machine
```bash
$ brew update
$ brew upgrade # if you want this!
$ brew install node
```
When node and npm are installed make sure to restart your terminal to make use of the fresh installed versions.

Webpack is need to build the Javascript library
```bash
$ npm install --global webpack
```

Typings must be installed for typing generation
```bash
$ npm i -g typings
```

For jQuery we need to install from dt source
```bash
$ typings install dt~jquery --global --save
```

Linter:
```bash
$ npm install --global tslint
```

Debug:
```bash
$ typings install debug --save
```

Use npm install to download the necessary dependencies
```bash
$ npm install
```

Use gulp test to run the test suite of the project
```bash
$ gulp test
```

To lint the code,
```bash
$ gulp tslint
```

To build the Javascript library, compressed:
```bash
$ gulp webpack
```
Alternatively, if you want to keep debug statements, run
```bash
$ gulp webpack-debug
```

## Roadmap ##
Setup Typescript compiler options
"declaration": false
"noImplicitAny": true

- Implement new plugins (EMV, Calypso, eID for other countries)

## Distribution ##
Registered bower:
`bower register trust1connector git://github.com/Trust1Team/t1c-lib-js.git

## License

```
This file is part of the Trust1Team(R) sarl project.
 Copyright (c) 2014 Trust1Team sarl
 Authors: Trust1Team development

 
This program is free software; you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License version 3
 as published by the Free Software Foundation with the addition of the
 following permission added to Section 15 as permitted in Section 7(a):
 FOR ANY PART OF THE COVERED WORK IN WHICH THE COPYRIGHT IS OWNED BY Trust1T,
 Trust1T DISCLAIMS THE WARRANTY OF NON INFRINGEMENT OF THIRD PARTY RIGHTS.

 This program is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 or FITNESS FOR A PARTICULAR PURPOSE.
 See the GNU Affero General Public License for more details.
 You should have received a copy of the GNU Affero General Public License
 along with this program; if not, see http://www.gnu.org/licenses or write to
 the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 Boston, MA, 02110-1301 USA.

 The interactive user interfaces in modified source and object code versions
 of this program must display Appropriate Legal Notices, as required under
 Section 5 of the GNU Affero General Public License.

 
You can be released from the requirements of the Affero General Public License
 by purchasing
 a commercial license. Buying such a license is mandatory if you wish to develop commercial activities involving the Trust1T software without
 disclosing the source code of your own applications.
 Examples of such activities include: offering paid services to customers as an ASP,
 Signing PDFs on the fly in a web application, shipping OCS with a closed
 source product...
Irrespective of your choice of license, the T1T logo as depicted below may not be removed from this file, or from any software or other product or service to which it is applied, without the express prior written permission of Trust1Team sarl. The T1T logo is an EU Registered Trademark (n° 12943131).
```
# Release Notes
## v1.3.10
###Story
*   [[T1C-756](https://trust1t.atlassian.net/browse/T1C-756)] - Add activated endpoint to LuxTrust

## v1.3.9
### Story

*   [[T1C-747](https://trust1t.atlassian.net/browse/T1C-747)] - No longer attempt to sync on initialization for managed installs

### Other
*   Correctly allow the OCV url to be set using config


## v1.3.8
### Other

*   Fix issue where PIV/CIV container was identified as PIV (uppercase); brought in line with other containers (lowercase)
*   Added some LuxTrust examples with certificate parsing enabled


## v1.3.7
###Other

*   Fix issue with callback detection: if an object (such as request options) was passed in a position that can contain a callback, in specific cases we would incorrectly assume it to be a callback function, and attempt to call it.



##v1.3.6
### Other

*   Added generic DumpData method to return all relevant card data


##v1.3.5
### Bug

*   [[CTIE-16](https://trust1t.atlassian.net/browse/CTIE-16)] - Fixed issue where parsing certificates would fail on IE11 and other ECMAScript 5 browsers



## v1.0.2
### Bug

*   [[T1C-503](https://trust1t.atlassian.net/browse/T1C-503)] - Fix issue where activation logic would fail on new installations


## v1.0.0
### Task

*   [[T1C-408](https://trust1t.atlassian.net/browse/T1C-408)] - Add support to get the version of the T1C-JS

### Other

*   jQuery dependency was only used for making HTTP requests. Replaced with Axios HTTP library to reduce footprint. Some code incompatibilities may occur.


##v0.9.11
### Task

*   [[T1C-475](https://trust1t.atlassian.net/browse/T1C-475)] - Provide OCV integration in T1C-JS


##v0.9.8
### Bug

*   [[T1C-470](https://trust1t.atlassian.net/browse/T1C-470)] - T1C-JS: The download functionality no longer works

## v0.9.7 ###
### Story

*   [[T1C-423](https://trust1t.atlassian.net/browse/T1C-423)] - T1C-DS: Download of GCL artifacts through reverse proxy
*   [[T1C-424](https://trust1t.atlassian.net/browse/T1C-424)] - Add support to download artifacts based on the API-key
*   [[T1C-438](https://trust1t.atlassian.net/browse/T1C-438)] - Proxy URI not well resolved when executed in JS lib

## v0.9.6
### Story

*   [[T1C-431](https://trust1t.atlassian.net/browse/T1C-431)] - Update JS lib to support reverse proxy for google bucket downloads

## v0.9.2
### Bug

*   [[T1C-367](https://trust1t.atlassian.net/browse/T1C-367)] - platform dependency missing in js dist

### Story

*   [[T1C-366](https://trust1t.atlassian.net/browse/T1C-366)] - EMV interface implementation
*   [[T1C-418](https://trust1t.atlassian.net/browse/T1C-418)] - JS lib doesn't work with IE9

## v0.9.0
### Story

*   [[T1C-269](https://trust1t.atlassian.net/browse/T1C-269)] - Define interface JS lib
*   [[T1C-328](https://trust1t.atlassian.net/browse/T1C-328)] - T1C-JS update registration/activations flows
*   [[T1C-348](https://trust1t.atlassian.net/browse/T1C-348)] - URL rewrite the download link when using proxy in JS-lib

### Task

*   [[T1C-274](https://trust1t.atlassian.net/browse/T1C-274)] - Demo Web app + demo app + DS API


[Trust1Team-url]: http://trust1team.com
[Trust1Connector-url]: http://www.trust1connector.com
[Trust1Connector-gitter]: https://gitter.im/Trust1Team/Trust1Connector?utm_source=share-link&utm_medium=link&utm_campaign=share-link
[t1t-logo]: http://imgur.com/lukAaxx.png
[t1c-logo]: http://i.imgur.com/We0DIvj.png
[jwt-up-doc]: https://trust1t.atlassian.net/wiki/pages/viewpage.action?pageId=74547210
