/**
 * [node-patternlibrary] - DependencyChord Bar
 * 
 * This module sets up the search bar.
 *     
 * @package     [node-patternlibrary]
 * @subpackage  [node-patternlibrary] DependencyChord
 * @author      Björn Bartels <coding@bjoernbartels.earth>
 * @link        https://gitlab.bjoernbartels.earth/groups/themes
 * @license     http://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0
 * @copyright   copyright (c) 2016 Björn Bartels <coding@bjoernbartels.earth>
 */

import PatternlibraryCore from '../app/core';
import * as d3 from 'd3';

//require('../vendor/d3');
//require('../vendor/d3.layout');

const DependencyChord_Defaults = { 
    width      : 640,
    
    linkTension: 0.66,
    
    height     : null, // 420,
    diameter   : null, // 420, // d = w * 2 / 3
    
    radius     : null, // 210, // r = d / 2
    innerRadius: null, // 90, // ri = r - 120
}

const DependencyChord = class DependencyChord extends PatternlibraryCore.Module {

    /**
     * initializes search bar objects on page...
     * 
     * @class DependencyChord
     * @param {HTMLElement} element - DOM element to apply module
     * @param {object} options - module options
     * 
     * @module Patternlibrary.Ui.DependencyChord
     */
    constructor (element, options) {
        super(element, options);
        
        this.$element = element;
        this.options = $.extend({}, this.options, DependencyChord_Defaults, this.$element.data(), options);

        
        this._init();
 
        patternlibrary.Ui.initialize(this);
        
    }
  
    /**
     * Initializes the component object ...
     * @private
     */
    _init () {

        // ... init stuff
        this.initDependencyChord();
 
    };

    initDependencyChord() {
        var $chord = this; 

        d3.json("/pl/patterns.json", function(error, classes) {
            
            if (error) throw (error);
            
            var patterns = [];
            for (var key in classes) {
                if ( typeof classes[key] != 'undefined' ) {
                    patterns.push(classes[key]);
                }
            }
    
            var root = $chord.packageHierarchy(patterns);
          
            $chord.cluster(root);
            
            $chord.link
                .data($chord.packageImports(root.leaves()))
                .enter().append("path")
                    .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
                    .attr("class", "link")
                    .attr("d", $chord.line);
        
            $chord.node
                .data(root.leaves())
                .enter().append("text")
                    .attr("class", "node")
                    .attr("dy", "0.31em")
                    .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
                    .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
                .text(function(d) { return d.data.pattern.name; })
                    .on("mouseover.patternlibrary", $chord.nodeMouseOver.bind($chord) )
                    .on("mouseout.patternlibrary", $chord.nodeMouseOut.bind($chord) );
        });
        
    };

    clearChord () {
    	this.container.find('.canvas').remove();
    }
    
    nodeMouseOver (d) {
        this.node
            .each(function(n) { n.target = n.source = false; });
    
        this.link
            .classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
            .classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
          .filter(function(l) { return l.target === d || l.source === d; })
            .raise();
    
        this.node
            .classed("node--target", function(n) { return n.target; })
            .classed("node--source", function(n) { return n.source; });
    };
    
    nodeMouseOut (d) {
        this.link
            .classed("link--target", false)
            .classed("link--source", false);
    
        this.node
            .classed("node--target", false)
            .classed("node--source", false);
    }
    
    /**
     * Lazily constructs the package hierarchy from (list of) class names.
     * 
     * @param {array} classes
     * @returns {d3.hierarchy}
     */
    packageHierarchy (classes) {
      var map = {};
    
      function find(name, data) {
        var node = map[name], i;
        if (!node) {
          node = map[name] = data || {name: name, children: []};
          if (name && name.length) {
            node.parent = find(name.substring(0, i = name.lastIndexOf("/")));
            node.parent.children.push(node);
            node.key = name.substring(i + 1);
          }
        }
        return node;
      }
    
      classes.forEach(function(d) {
        find(d.pattern.name, d);
      });
    
      return d3.hierarchy(map[""]);
    };
    
    
    /**
     * Returns a list of imports for the given array of nodes.
     * 
     * @param {d3.hierarchy}
     * @returns {array}
     */
    packageImports (nodes) {
      var map = {},
          imports = [];
    
      // Compute a map from name to node.
      nodes.forEach(function(d) {
          if (d.data.pattern && d.data.pattern.name) {
                map[d.data.pattern.name] = d;
          }
      });
    
      // For each import, construct a link from the source to target node.
      nodes.forEach(function(d) {
        if (d.data.pattern && d.data.pattern.uses) {
            d.data.pattern.uses.forEach(function(i) {
                if (map[d.data.pattern.name] && (typeof map[d.data.pattern.name].path == 'function')) {
                      //imports.push({source: map[d.pattern.name], target: map[i]});
                    imports.push(map[d.data.pattern.name].path(map[i]));
                }
            });
        }
      });
    
      return imports;
    };
    
    /**
     * Retrieves canvas width
     * 
     * @var {number}
     */
    get width () {
        if (!this.options.width) {
            this.options.width = 420;
        }
        return (this.options.width);
    };
    
    /**
     * Retrieves canvas height
     * 
     * @var {number}
     */
    get height () {
        if (!this.options.height) {
            this.options.height = this.options.width;
        }
        return (this.options.height);
    };
    
    /**
     * Retrieves chord inner radius
     * 
     * @var {number}
     */
    get innerRadius () {
        if (!this.options.innerRadius) {
            this.options.innerRadius = this.radius - 120;
        }
        return (this.options.innerRadius);
    };
    
    /**
     * Retrieves chord radius
     * 
     * @var {number}
     */
    get radius () {
        if (!this.options.radius) {
            this.options.radius = this.diameter / 2;
        }
        return (this.options.radius);
    };
    
    /**
     * Retrieves chord diameter
     * 
     * @var {number}
     */
    get diameter () {
        if (!this.options.diameter) {
            this.options.diameter = this.d3.min([this.width, this.height]);
        }
        return (this.options.diameter);
    };
    
    /**
     * Retrieves 'd3' cluster instance
     * 
     * @var {d3.cluster}
     */
    get cluster  () {
        return d3.cluster()
            .size([360, this.innerRadius]);
    };
    
    /**
     * Retrieves 'd3' line instance
     * 
     * @var {d3.radialLine}
     */
    get line () {
        var line = d3.radialLine()
            .curve(d3.curveBundle.beta(0.66))
            .radius(function(d) { return d.y; })
            .angle(function(d) { return d.x / 180 * Math.PI; });
        return line;
    };
    

    
    /**
     * Retrieves svg 'node' element instances
     * 
     * @var {d3.Selection}
     */
    get node () {
        var $nodeGroup = this.canvas.select('g.nodes');
        if ($nodeGroup.empty()) {
            $nodeGroup = this.canvas.append("g")
                .attr("class", 'nodes');
        }
        return ( $nodeGroup.selectAll(".node") );
    };
    
    /**
     * Retrieves svg 'link' (line) element instances
     * 
     * @var {d3.Selection}
     */
    get link () {
        var $linkGroup = this.canvas.select('g.links');
        if ($linkGroup.empty()) {
            $linkGroup = this.canvas.append("g")
                .attr("class", 'links');
        }
        return ( $linkGroup.selectAll(".link") );
    };
    
    /**
     * Retrieves 'd3' svg element object
     * 
     * @var {d3.Selection}
     */
    get canvas  () {
        var $canvas = this.container.select('svg');
        if ($canvas.empty()) {
            $canvas = this.container.append("svg")
                .attr("width", this.width)
                .attr("height", this.height)
              .append("g")
                .attr("transform", "translate(" + (this.width / 2) + "," + (this.height / 2) + ")");
        }
        return ($canvas.select('g'));
    };
    
    /**
     * Retrieves 'd3' container element 
     * 
     * @var {d3.Selection}
     */
    get container  () {
        // ! here be dragons: 
        // this.$element[0] reffers to native element object ;)
        return ( this.d3.select( this.$element[0] ) );
    };
    
    /**
     * Retrieves 'd3' instance
     * 
     * @var {d3}
     */
    get d3  () {
        if (typeof d3 == 'undefined') {
            throw 'Fatal Error: "d3" is undefined !';
        }
        return ( d3 );
    };
    
    /**
     * Destroys the Component.
     * 
     * @function
     * @access private
     */
    _destroy () {
        // ... clean up stuff
        this.$element.find('*').off('.patternlibrary');
        patternlibrary.Ui.unregister(this);
    };
  
};


export default DependencyChord;
