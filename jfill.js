/*
 * JFill - Javascript Template Engine
 *
 *                                         Ronen Barzel
 * [see README.txt]
 *
 */

/*
 * inspired by and based on Patroon by Matthias Georgi (matthias-georgi.de)
 * major changes:
 *   - top level can be an array
 *   - scoped everything with JFill
 *
 * much of the code comes directly from patroon, that code is covered by
 * the following copyright:
 * Patroon - Javascript Template Engine
 *
 * Copyright (c) 2008 Matthias Georgi (matthias-georgi.de)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

var JFill = function() {
  if ( typeof jQuery != "undefined" ) {
      jQuery.fn.jfill = function(template, data) {
          var nodes = template.fill(data);
          for (var i=0; i<nodes.length; i++) {
            this.append(nodes[i]);
        }
        return this;
    };
  }
  return {}
}();

JFill.Template = function (expr) {
    if ( typeof jQuery != "undefined" ) {
        this.element = $(expr).get(0);
    } else {
        this.element = document.getElementById(expr);
    }
    this.eval = {};

    if (this.element) {
        this.element.parentNode.removeChild(this.element);
        this.compileNode(this.element);
    }
    else {
        throw "template not found: " + id;
    }
};


JFill.Template.Helper = {

    linkTo: function(text, url) {
        if (url.indexOf('http://') == -1 && url[0] != '/' && url[0] != '#') {
            url = 'http://' + url;
        }
        return '<a href="' + url +'">' + text + '</a>';
    }

};

JFill.Template.prototype = {

    fill: function(data) {
        var container = document.createElement('div');

        container.appendChild(this.element.cloneNode(true));
        this.expandData(data, container.childNodes[0], new JFill.Metadata(data));

        var nodes = [];
        for (i = 0; i < container.childNodes.length; i++) {
            nodes.push(container.childNodes[i]);
        }
        return nodes;
    },

    expandData: function(data, node, metadata) {
        if (data.constructor == Array) {
            this.expandArray(data, node, metadata);
        }
        else {
            this.expandObject(data, node, metadata);
        }
    },

    expandArray: function(data, node, metadata) {
        var parent = node.parentNode;
        var sibling = node.nextSibling;
        parent.removeChild(node);
        for (var i = 0; i < data.length; i++) {
            var child = node.cloneNode(true);
            parent.insertBefore(child, sibling);
        }
    },

    expandByContext: function(object, node, metadata) {
        var names = node.className.split(' ');
        var found = false;

        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            if (object[name]) {
                this.expandData(object[name], node, new JFill.Metadata(object[name], {parent: metadata}));
                found = true;
            }
        }

        if (!found) {
            this.expandObject(object, node, metadata);
            this.expandData(data[i], child, new JFill.Metadata(data[i], {array: data, index: i, parent: metadata.parent}));
        }
    },

    expandObject: function(object, node, metadata) {
        var i;
        var nodes = [];

        for (i = 0; i < node.childNodes.length; i++) {
            nodes.push(node.childNodes[i]);
        }

        for (i = 0; i < node.attributes.length; i++) {
            var attr = node.attributes[i];
            if (this.eval[attr.value]) {
                attr.value = this.eval[attr.value](object, metadata);
            }
        }

        for (i = 0; i < nodes.length; i++) {
            var child = nodes[i];
            if (child.nodeType == 1) {
                this.expandByContext(object, child, metadata);
            }
            if (child.nodeType == 3 && this.eval[child.nodeValue])  {
                var span = document.createElement('span');
                span.innerHTML = this.eval[child.nodeValue](object, metadata);
                child.parentNode.replaceChild(span, child);
            }
        }
    },


    compile: function(str) {
        var len = str.length;
        var expr = false;
        var cur = '';
        var out = [];
        var braces = 0;

        for (var i = 0; i < len; i++) {
            var c = str[i];

            if (expr) {
                if (c == '{') {
                    braces += 1;
                }
                if (c == '}') {
                    braces -= 1;
                    if (braces == 0) {
                        expr = false;
                        if (cur.length > 0) {
                            out.push("(" + cur + ")");
                        }
                        cur = "";
                    }
                }
                else {
                    cur += c;
                }
            }
            else {
                switch (c) {
                case "'":
                    cur += "\\'";
                    break;
                case "\\":
                    cur += "\\\\";
                    break;
                case '{':
                    expr = true;
                    braces += 1;
                    if (cur.length > 0) {
                        out.push("'" + cur + "'");
                    }
                    cur = "";
                    break;
                case "\n":
                    break;
                default:
                    cur += c;
                }
            }
        }

        if (cur.length > 0) {
            out.push("'" + cur + "'");
        }

        this.eval[str] = new Function('data', 'jfill', 'with(JFill.Template.Helper) with (data) return ' + out.join('+') + ';' );
    },

    compileNode: function(node) {
        var i;

        if (node.nodeType == 1) {
            for (i = 0; i < node.attributes.length; i++) {
                var value = node.attributes[i].value;
                if (value.indexOf('{') > -1) {
                    this.compile(value);
                }
            }
            for (i = 0; i < node.childNodes.length; i++) {
                this.compileNode(node.childNodes[i]);
            }
        }

        if (node.nodeType == 3 && node.nodeValue.indexOf('{') > -1)  {
            this.compile(node.nodeValue);
        }

    }

};

JFill.Metadata = function(data) {
    this.data = data;

    opts = arguments[1] || {};
    this.parent = opts.parent;
    this.array = opts.array;
    this.index = opts.index;

    if (this.array) {
        this.oddEven = (this.index % 2 == 0) ? "even" : "odd";
        this.isFirst = (this.index == 0);
        this.isLast = (this.index == (this.array.length - 1));
        this.firstLast = (this.isFirst && this.isLast ? "first last" : this.isFirst ? "first" : this.isLast ? "last" : "");
    }
};


