/* eslint func-names: "off" */
/* eslint no-console: "off" */
/* eslint no-unused-vars: "off" */

import * as tubeMap from './tubemap';
import * as paragraph from './paragraph';

document.getElementById('parseButtonParagraph').onclick = function () {
  let nodes;
  let tracks;
  let reads;
  const jsonerror = $('#jsonerror');
  jsonerror.hide().text('');
  try {
    const pg = JSON.parse(document.getElementById('textarea2').value);
    nodes = paragraph.paragraphExtractNodes(pg);
    tracks = paragraph.paragraphExtractTracks(pg, nodes);
    reads = paragraph.paragraphExtractReads(pg);
  } catch (e) {
    console.log(e);
    jsonerror.show().text(`Error creating plot: ${e}`);
    return;
  }

  $('.nav-tabs a[href="#TubemapPlot"]').tab('show');
  setTimeout(() => {
    tubeMap.create({
      svgID: '#svg',
      nodes,
      tracks,
      reads,
    });
  }, 200);
};

document.getElementById('downloadButton').onclick = function () {
  const svgN = document.getElementById('svg');
  const svgData = (new XMLSerializer()).serializeToString(svgN);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  const downloadLink = document.createElement('a');
  downloadLink.href = svgUrl;
  downloadLink.download = 'graph.svg';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

document.getElementById('inputFileParagraph').addEventListener('change', (e) => {
  const file = document.getElementById('inputFileParagraph').files[0];
  console.log(file);
  const reader = new FileReader();
  reader.onload = function (er) {
    document.getElementById('textarea2').value = reader.result;
  };
  reader.readAsText(file);
});

document.getElementById('includeBadAlignCheckbox').onclick = function () {
  if (document.getElementById('includeBadAlignCheckbox').checked === true) paragraph.setIncludeBadAlign(true);
  else paragraph.setIncludeBadAlign(false);
};

document.getElementById('showPositionsCheckbox').onclick = function () {
  if (document.getElementById('showPositionsCheckbox').checked === true) paragraph.setShowPositions(true);
  else paragraph.setShowPositions(false);
};

document.getElementById('useReferenceSequence').onclick = function () {
  if (document.getElementById('useReferenceSequence').checked === true) paragraph.setUseRefSequence(true);
  else paragraph.setUseRefSequence(false);
};

document.getElementById('useReferenceSequenceLong').onclick = function () {
  if (document.getElementById('useReferenceSequenceLong').checked === true) paragraph.setUseRefSequenceLong(true);
  else paragraph.setUseRefSequenceLong(false);
};

paragraph.setReadColoring('mapping');
document.getElementById('readsSingle').onchange = function () {
  paragraph.setReadColoring('#aaaaaa');
};

document.getElementById('readsAlternate').onchange = function () {
  paragraph.setReadColoring('alternate');
};

document.getElementById('readsAlignmentStatus').onchange = function () {
  paragraph.setReadColoring('mapping');
};

document.getElementById('readsStrand').onchange = function () {
  paragraph.setReadColoring('strand');
};

paragraph.setReadOpacity('');
document.getElementById('readsOpacityNone').onchange = function () {
  paragraph.setReadOpacity('');
};

document.getElementById('readsOpacityMapq').onchange = function () {
  paragraph.setReadOpacity('mapq');
};

document.getElementById('readsOpacityGraphMapq').onchange = function () {
  paragraph.setReadOpacity('graphMapQ');
};

document.getElementById('linear').onchange = function () {
  tubeMap.setNodeWidthOption(0);
};

document.getElementById('log2').onchange = function () {
  tubeMap.setNodeWidthOption(1);
};

document.getElementById('divide100').onchange = function () {
  tubeMap.setNodeWidthOption(2);
};

