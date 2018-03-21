/* eslint func-names: "off" */
/* eslint no-console: "off" */
/* eslint no-unused-vars: "off" */
// We need these to conditionally import a user config
/* eslint import/no-unresolved: "off" */
/* eslint global-require: "off" */

import * as mergeJSON from 'merge-json';

import * as tubeMap from './tubemap';
import * as vg from './vg';
import * as paragraph from './paragraph';

let CONFIG = require('../../config.default.json');

try {
  // Ordinarily this wouldn't work at all with browserify, but we use the
  // browserify-optional transform that makes it work great.
  CONFIG = mergeJSON.merge(CONFIG, require('../../config.json'));
} catch (err) {
    // Ignore errors; probably means the override config didn't exist at build
    // time.
}

const BACKEND_URL = CONFIG.BACKEND_URL || `http://${window.location.host}`;
const DATA_SOURCES = CONFIG.DATA_SOURCES;

$('#dataSourceSelect').change(() => {
  $('#distance').prop('value', '100');
  $('#unitSelect').prop('value', '1');
  if ($('#dataSourceSelect').val() === 'custom') {
    $('#xgFileSelect').prop('disabled', false);
    $('#gbwtFileSelect').prop('disabled', false);
    $('#gamIndexSelect').prop('disabled', false);
    $('#pathNameSelect').prop('disabled', false);
    $('#position').prop('value', '1');
  } else {
    $('#xgFileSelect').prop('disabled', true);
    $('#gbwtFileSelect').prop('disabled', true);
    $('#gamIndexSelect').prop('disabled', true);
    $('#pathNameSelect').prop('disabled', true);

    DATA_SOURCES.forEach((ds) => {
      if (ds.name === $('#dataSourceSelect').val()) {
        $('#position').prop('value', ds.defaultPosition);
      }
    });
  }
});

$('#xgFileSelect').change(() => {
  $('#pathNameSelect').empty();
  if ($('#xgFileSelect').val() === 'none') {
    // $('#pathNameSelect').empty();
  } else {
    getPathNames();
    // $('#pathNameSelect').append('<option value="foo" selected>foo</option>');
  }
});

function getPathNames() {
  const xgFile = $('#xgFileSelect').val();
  $.ajax({
    type: 'POST',
    url: `${BACKEND_URL}/getPathNames`,
    crossDomain: true,
    data: { xgFile },
    dataType: 'json',
    success(response) {
      const pathNameSelect = document.getElementById('pathNameSelect');
      response.pathNames.forEach((fn) => {
        const opt = document.createElement('option');
        $('#pathNameSelect').append(`<option value="${fn}" selected>${fn}</option>`);
      });
    },
    error(responseData, textStatus, errorThrown) {
      console.log('POST failed.');
    },
  });
}

// display filename of chosen file in file picker
/* $('input[type=file]').change(() => {
  console.log('foo');
  let fieldVal = $(this).val();
  if (fieldVal !== undefined || fieldVal !== '') {
    console.log(fieldVal);
    console.log(/\\([^\\]+$)/.exec(fieldVal));
    // removes 'fakepath' and keeps only filename after last '/'
    fieldVal = /\\([^\\]+$)/.exec(fieldVal)[1];
    $(this)
    .next('.custom-file-control')
    .attr('data-content', fieldVal);
  }
}); */

document.getElementById('goButton').onclick = function () {
  prepareForTubeMap();
};

document.getElementById('goLeftButton').onclick = function () {
  const position = Number(document.getElementById('position').value);
  const distance = Number(document.getElementById('distance').value);
  document.getElementById('position').value = Math.max(position - distance, 0);
  prepareForTubeMap();
};

document.getElementById('goRightButton').onclick = function () {
  const position = Number(document.getElementById('position').value);
  const distance = Number(document.getElementById('distance').value);
  document.getElementById('position').value = position + distance;
  prepareForTubeMap();
};

function prepareForTubeMap() {
  d3
    .select('#svg')
    .selectAll('*')
    .remove();
  d3.select('#svg').attr('width', 100);
  const w = $('.tubeMapSVG').width();
  $('#legendDiv').html('');
  document
    .getElementById('loader')
    .setAttribute('style', `left:${(w / 2) - 25}px`);

  /* if ($('#dataSourceSelect').val() === 'cactus') {
    getCactusTubeMapData();
  } else {
    getRemoteTubeMapData();
  } */
  getRemoteTubeMapData();
}

function getRemoteTubeMapData() {
  const nodeID = document.getElementById('position').value;
  const distance = document.getElementById('distance').value;
  const byNode = (document.getElementById('unitSelect').selectedIndex !== 0);

  let xgFile = $('#xgFileSelect').val();
  let gbwtFile = $('#gbwtFileSelect').val();
  let gamIndex = $('#gamIndexSelect').val();
  let anchorTrackName = $('#pathNameSelect').val();
  let useMountedPath = true;

  DATA_SOURCES.forEach((ds) => {
    if (ds.name === $('#dataSourceSelect').val()) {
      console.log('found');
      xgFile = ds.xgFile;
      gbwtFile = ds.gbwtFile;
      gamIndex = ds.gamIndex;
      anchorTrackName = ds.anchorTrackName;
      useMountedPath = ds.useMountedPath;
    }
  });

  console.log(`useMountedPath = ${useMountedPath}`);
  console.log(`anchorTrackName = ${anchorTrackName}`);

  $.ajax({
    type: 'POST',
    url: `${BACKEND_URL}/chr22_v4`,
    crossDomain: true,
    data: { nodeID, distance, byNode, xgFile, gbwtFile, gamIndex, anchorTrackName, useMountedPath },
    dataType: 'json',
    success(response) {
      if ($.isEmptyObject(response)) {
        console.log('empty');
        document.getElementById('loader').style.display = 'none';
        return;
      }
      const nodes = vg.vgExtractNodes(response.graph);
      const tracks = vg.vgExtractTracks(response.graph);
      const reads = vg.vgExtractReads(nodes, tracks, response.gam);
      createTubeMap(nodes, tracks, reads);
    },
    error(responseData, textStatus, errorThrown) {
      console.log('POST failed.');
    },
  });
  // return false; // prevents browser from reloading page (button within form tag)
}

function createTubeMap(nodes, tracks, reads) {
  tubeMap.create({
    svgID: '#svg',
    nodes,
    tracks,
    reads,
  });
  document.getElementById('loader').style.display = 'none';
}

/* function readsFromStringToArray(readsString) {
  const lines = readsString.split('\n');
  const result = [];
  lines.forEach((line) => {
    if (line.length > 0) {
      result.push(JSON.parse(line));
    }
  });
  return result;
} */

document.getElementById('redundantNodesCheckbox').onclick = function () {
  if (document.getElementById('redundantNodesCheckbox').checked === true) tubeMap.setMergeNodesFlag(true);
  else tubeMap.setMergeNodesFlag(false);
};

document.getElementById('compressedViewCheckbox').onclick = function () {
  if (document.getElementById('compressedViewCheckbox').checked === true) tubeMap.setNodeWidthOption(1);
  else tubeMap.setNodeWidthOption(0);
};

document.getElementById('showReadsCheckbox').onclick = function () {
  if (document.getElementById('showReadsCheckbox').checked === true) tubeMap.setShowReadsFlag(true);
  else tubeMap.setShowReadsFlag(false);
};

document.getElementById('softClipsCheckbox').onclick = function () {
  if (document.getElementById('softClipsCheckbox').checked === true) tubeMap.setSoftClipsFlag(true);
  else tubeMap.setSoftClipsFlag(false);
};

/* document.getElementById('positionTypeSelect').onchange = function () {
  document.getElementById('distanceTypeSelect').selectedIndex = this.selectedIndex;
};

document.getElementById('distanceTypeSelect').onchange = function () {
  document.getElementById('positionTypeSelect').selectedIndex = this.selectedIndex;
}; */

const radios = document.getElementsByClassName('colorRadio');
for (let i = 0; i < radios.length; i += 1) {
  let trackType;
  // console.log(radios[i].name);
  switch (radios[i].name) {
    case 'colorsHaplo':
      trackType = 'haplotypeColors';
      break;
    case 'colorsFwReads':
      trackType = 'forwardReadColors';
      break;
    case 'colorsRevReads':
      trackType = 'reverseReadColors';
      break;
    default:
      console.log('Could not find track type in color set assignment');
  }
  // console.log(radios[i].value);
  let colorSet;
  switch (radios[i].value) {
    case 'option1':
      colorSet = 'plainColors';
      break;
    case 'option2':
      colorSet = 'greys';
      break;
    case 'option3':
      colorSet = 'reds';
      break;
    case 'option4':
      colorSet = 'blues';
      break;
    case 'option5':
      colorSet = 'lightColors';
      break;
    default:
      console.log('Could not find color type in color set assignment');
  }
  radios[i].onclick = function () {
    console.log(this);
    tubeMap.setColorSet(trackType, colorSet);
  };
}

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

function populateDropdownsWithFilenames() {
  $.ajax({
    type: 'POST',
    url: `${BACKEND_URL}/getFilenames`,
    crossDomain: true,
    // dataType: 'json',
    success(response) {
      const xgSelect = document.getElementById('xgFileSelect');
      response.xgFiles.forEach((filename) => {
        const opt = document.createElement('option');
        opt.value = filename;
        opt.innerHTML = filename;
        xgSelect.appendChild(opt);
      });
      const gbwtSelect = document.getElementById('gbwtFileSelect');
      response.gbwtFiles.forEach((filename) => {
        const opt = document.createElement('option');
        opt.value = filename;
        opt.innerHTML = filename;
        gbwtSelect.appendChild(opt);
      });
      const gamIndexSelect = document.getElementById('gamIndexSelect');
      response.gamIndices.forEach((filename) => {
        const opt = document.createElement('option');
        opt.value = filename;
        opt.innerHTML = filename;
        gamIndexSelect.appendChild(opt);
      });
    },
    error(responseData, textStatus, errorThrown) {
      console.log('POST failed.');
    },
  });
}

window.onload = function () {
  // populate UI 'data' dropdown with data from DATA_SOURCES
  const dsSelect = document.getElementById('dataSourceSelect');
  DATA_SOURCES.forEach((ds) => {
    const opt = document.createElement('option');
    opt.value = ds.name;
    opt.innerHTML = ds.name;
    dsSelect.appendChild(opt);
  });
  const opt = document.createElement('option');
  opt.value = 'custom';
  opt.innerHTML = 'custom';
  dsSelect.appendChild(opt);

  document.getElementById('goButton').click();
  populateDropdownsWithFilenames();
};
