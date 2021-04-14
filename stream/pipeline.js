const split = require('split2');
const model = require('pelias-model');
const parser = require('./parser');
const unwrap = require('./unwrap');
const centroid = require('./centroid');
const document = require('./document');
const adminLookup = require('pelias-wof-admin-lookup').create;

const through = require('through2');
const DUMP_TO = process.env.DUMP_TO;

function createDocumentMapperStream() {
  if(DUMP_TO) {
    return through.obj( function( model, enc, next ){
      next(null, model.callPostProcessingScripts());
    });
  }

  return model.createDocumentMapperStream();
}

function pipeline( streamIn, streamOut ){
  return streamIn
    .pipe( split() )
    .pipe( parser( 6 ) )
    .pipe( unwrap() )
    .pipe( centroid() )
    .pipe( document( 'openstreetmap', 'street', 'polyline' ) )
    .pipe( adminLookup() )
    .pipe( createDocumentMapperStream() )
    .pipe( streamOut );
}

module.exports = pipeline;
