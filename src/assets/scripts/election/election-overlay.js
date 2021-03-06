/*jshint undef:true browser:true devel:true*/
/*global define */

define(['d3.v3', 'underscore'], function(d3, _) {

  /* a county-by-county breakdown of the 2012 presidential election results */
  var ElectionOverlay = function(data, options) {
    this.name    = '2012 Presidental Election';
    this.options = options || {};
    this._data   = data;
    this.parties = {
      dem: {label: 'Obama',   color: '#000088'}, /* Democrat      */
      gop: {label: 'Romney',  color: '#880000'}, /* Republican    */
      lib: {label: 'Johnson', color: '#daca00'}, /* Libertarian   */
      grn: {label: 'Stein',   color: '#008800'}, /* Green Party   */
      jp:  {label: 'Goode',   color: '#880088'}, /* Justice Party */
      psl: {label: 'Lindsay', color: '#ff8800'}, /* Party for Socialism & Liberation */
      npd: {label: 'Other',   color: '#c0c0c0'}  /* Unaffiliated  */
    };

    _(this._data).each(function(votes, fips) {

      if (!votes.total) {
        /* calculate the total number of voters for this county */
        this._data[fips].total = _(votes).reduce(function(total, voteCount) {
          return total + voteCount;
        });
      }

      if (!votes.color) {
        /* calculate how to color this county based on the votes. */
        this._data[fips].color = d3.rgb(
          255 * votes.gop / votes.total,
          /* count all non republican/democat votes as 3rd party */
          255 * (votes.total - votes.gop - votes.dem) / votes.total,
          255 * votes.dem / votes.total
        );
      }
    }, this);

  };

  /* return the breakdown of the votes for the county represented by the given
   * FIPS number, or 'undefined' if we don't have any data for that county. */
  ElectionOverlay.prototype.data = function(fips) {
    return this._data[Number(fips)];
  };

  /* Given a county FIPS id, return it's associated color based on the voting
   * breakdown calculate earlier. */
  ElectionOverlay.prototype.color = function(fips) {
    var votes = this.data(fips);
    return votes ? votes.color : d3.rgb(0xc0, 0xc0, 0xc0);
  };

  ElectionOverlay.prototype.fill = function(d, i) {
    return this.color(d.id);
  };

  ElectionOverlay.prototype.fillOpacity = function(d, i) {
    return 1.0;
  };

  ElectionOverlay.prototype.stroke = function(d, i) {
    return this.color(d.id).darker(0.25);
  };

  ElectionOverlay.prototype.strokeOpacity = function(d, i) {
    return 1.0;
  };

  ElectionOverlay.prototype.mouseOver = function(node, d, i, map) {
    d3.select(node)
      .style('fill', this.color(d.id).brighter(0.75));

    var votes = this.data(d.id);

    /* if there's no data associated with this county, don't do anything. */
    if (!votes) {
      map.tooltip.hide();
      return;
    }

    var lines = _(this.parties).map(function(row, abbr){
      return { label: row.label,
               color: row.color,
               value: votes[abbr],
               total: votes.total
             };
    });

    map.tooltip.show({
      x: d3.event.x || d3.event.layerX,
      y: d3.event.y || d3.event.layerY,
      title: d.properties.name + " County",
      lines: lines,
      format: d3.format(','),
      bars:  true
    });
  };

  ElectionOverlay.prototype.mouseOut = function(node, d, i, map) {
    d3.select(node)
      .style('fill', this.color(d.id));
  };

  ElectionOverlay.prototype.mouseMove = function(node, d, i, map) {
    /* only move the tooltip if this county has associated data. */
    if (this.data(d.id)) {
      map.tooltip.move(
        d3.event.x || d3.event.layerX,
        d3.event.y || d3.event.layerY
      );
    }
  };

  return ElectionOverlay;

});
