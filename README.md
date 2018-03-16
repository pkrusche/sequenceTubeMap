# SequenceTubeMap for Paragraph

## License

This is a fork of [vgteam/sequenceTubeMap](https://github.com/vgteam/sequenceTubeMap). 

Copyright (c) 2017 Wolfgang Beyer, licensed under the MIT License.

## Modifications

This fork focuses on providing a static website where outputs from the 
[paragraph aligner and genotyping tools](https://github.com/illumina/paragraph) can be displayed. It does not 
contain any server-side components. To run and display alignments using [vg](https://github.com/vgteam/vg),
please visit the original fork at [github.com/vgteam/sequenceTubeMap](https://github.com/vgteam/sequenceTubeMap).

## Compiling

To make changes / test, run the following commands (you will need [nodeJS](https://nodejs.org),
 [npm](https://www.npmjs.com/) and [gulp](https://gulpjs.com/)).

```
cd <source-checkout-directory>
npm install --local
bower install
gulp 
gulp build
```

This will create the dist folder, which contains a build of the HTML page.

To test locally, run

```
gulp serve
```

This should open a browser instance with the ability to debug the code locally.
