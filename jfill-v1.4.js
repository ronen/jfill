/*
 * JFill - Javascript Template Engine, v1.4
 *
 * For usage instructions see:
 *      http://github.com/ronen/jfill/blob/v1.4/README.txt
 *
 * Version:     v1.4
 * Date:        Fri Nov 30 23:46:58 2012 +0000
 * Download:    http://cloud.github.com/downloads/ronen/jfill/jfill-v1.4.js
 */

/*
 * JFill is built upon Patroon by Mattias Georgi (matthias-georgi.de), and
 * much of the code comes directly from Patroon.  Additional JFill code by
 * Ronen Barzel (ronenbarzel.org).  The original and additional code are
 * made available via the "MIT License":
 * ----
 *
 * Original Patroon code: Copyright (c) 2008 Matthias Georgi (matthias-georgi.de)
 * Additional JFill code: Copyright (c) 2010 Ronen Barzel (ronenbarzel.org)
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
 * Except as contained in this notice, the name(s) of the above copyright
 * holders shall not be used in advertising or otherwise to promote the
 * sale, use or other dealings in this Software without prior written
 * authorization.
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
        this.element = jQuery(expr).get(0);
    } else {
        this.element = document.getElementById(expr);
    }
    this.eval = {};

    if (this.element) {
        this.element.parentNode.removeChild(this.element);
        this.compileNode(this.element);
    }
    else {
        throw "JFill: template not found: " + expr;
    }
};


JFill.Template.prototype = {

    fill: function(data) {
        var container = document.createElement('div');

        container.appendChild(this.element.cloneNode(true));
        this.expandData(new JFill.Metadata(data), container.childNodes[0]);

        var nodes = [];
        for (i = 0; i < container.childNodes.length; i++) {
            nodes.push(container.childNodes[i]);
        }
        return nodes;
    },

    expandData: function(metadata, node) {
        var data = metadata.data;
        if (data) {
            var expr;
            if (expr = node.getAttribute("jfill:if")) {
                node.setAttribute("jfill:if", "");
                if (!this.eval["jfill:"+expr](metadata)) {
                    data = undefined;
                }
            }
            if (expr = node.getAttribute("jfill:scope")) {
                node.setAttribute("jfill:scope", "");
                data = this.eval["jfill:"+expr](metadata);
                metadata = new JFill.Metadata(data, metadata);
            }
        }

        if (data == undefined) {
            node.parentNode.removeChild(node);
        }
        else if (data.constructor == Array) {
            this.expandArray(metadata, node);
        }
        else {
            this.expandObject(metadata, node);
        }
    },

    expandArray: function(metadata, node) {
        var parent = node.parentNode;
        var nitems = metadata.startArray();
        for (var i = 0; i < nitems; i++) {
            var child = node.cloneNode(true);
            this.expandData(metadata.useArrayItem(i), child);
            if (child.id && child.id == node.id) {
                child.id = child.id + "-" + i;
            }
            parent.insertBefore(child, node);
        }
        parent.removeChild(node);
    },

    expandObject: function(metadata, node) {
        var i;
        var nodes = [];

        for (i = 0; i < node.childNodes.length; i++) {
            nodes.push(node.childNodes[i]);
        }

        for (i = 0; i < node.attributes.length; i++) {
            var attr = node.attributes[i];
            if (this.eval[attr.value]) {
                // handle class specially for IE6 compatibility
                var result = this.eval[attr.value](metadata);
                if (attr.name == "class") {
                    node.setAttribute("class", null);
                    node.className = result;
                }
                else node.setAttribute(attr.name, result);
            }
        }

        for (i = 0; i < nodes.length; i++) {
            var child = nodes[i];
            if (child.nodeType == 1) {
                this.expandData(metadata, child);
            }
            if (child.nodeType == 3 && this.eval[child.nodeValue])  {
                child.nodeValue = this.eval[child.nodeValue](metadata);
            }
        }
    },


    compile: function(str,isControl) {
        var expr = false;
        var cur = '';
        var out = [];
        var braces = 0;
        var key = str;

        if (isControl) {
            key = "jfill:" + str;
            if (str.substr(0,1) != '{') str = '{' + str + '}';
        }

        var len = str.length;
        for (var i = 0; i < len; i++) {
            var c = str.substr(i,1);

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

        if (isControl) {
            body = "try { return " + out[0] + "; } catch (ReferenceError) { return undefined; }";
        }
        else {
            body = "return " + out.join('+') + ";";
        }
        this.eval[key] = new Function('jfill', 'with (jfill.data) ' + body);
    },

    compileNode: function(node) {
        var i;

        if (node.nodeType == 1) {
            for (i = 0; i < node.attributes.length; i++) {
                var name = node.attributes[i].nodeName;
                var value = node.attributes[i].value;
                if (value && typeof value == "string") {
                    if (name.indexOf("jfill:") == 0) {
                        this.compile(value, true);
                    } else if (value.indexOf('{') > -1) {
                        this.compile(value);
                    }
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

JFill.Metadata = function(data, parent) {
    this.data = data;
    this.parent = parent;
};

JFill.Metadata.prototype.startArray = function() {
    this.array = this.data;
    return this.array.length;
};

JFill.Metadata.prototype.useArrayItem = function(i) {
    this.data = this.array[i];
    this.index = i;
    this.oddEven = (i % 2 == 0) ? "even" : "odd";
    this.isFirst = (i == 0);
    this.isLast = (i == (this.array.length - 1));
    this.firstLast = (this.isFirst && this.isLast ? "first last" : this.isFirst ? "first" : this.isLast ? "last" : "");
    return this;
};
