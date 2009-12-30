JFill - a Javascript Template Engine
======================================

JFill is a javascript HTML template engine.  It takes a template in the
form of a DOM subtree, and fills it from a java object, using string
interpolation inside attribute values and text nodes.  It recursively
expands arrays and subobjects into the template.

### Usage

    template = new JFill.Template(jquery_expression);    // if using jQuery
    template = new JFill.Template(id); // if not using jQuery

         Removes the given element subtree from the DOM, returning a
         template object.
 
    nodes = template.fill(data)     // returns array with filled node(s)
    $(jexpr).jfill(template, data)  // jquery-based appends filled node(s)

        Fills the template using the data object.  If the data is an array,
        fills multiple copies of the template, one for each data object in
        the array.  The data properties can be text or nested objects or
        arrays.

    Filling has the following rules:
 
      + Baseline - String Interpolation: In any text or attribute anywhere
        in the template DOM subtree, any string of the form {...} is
        replaced with its javascript evaluation, in the context of the
        current data object.  For example if the data object has a property
        "name", the template could have a tag such as:
            <div>Name: {name}</div>
        or an arbitrary expression
            <div>Spelling: {name.toUpperCase.split('').join('-')}</div>



### Example

Data is in the form an object or array of objects, which can contain
properties in the form of text or nested objects or arrays.  For example:

    var data = { 
      comment: [{
        time: "2008-09-07 12:28:33", 
        name: "David Beckham",
        website: "beckham.com",
        text: "I watched the euro finals on tv..." 
      }, { 
        time: "2008-09-07 14:28:33", 
        name: "Tuncay",
        website: "",
        text: "Me too"
      }]
    };
    

This data can be filled into the following template:

        <div class="comments">  
          <div id="comments-template">
            <div class="comment">
              <div class="top">
                {website.length > 0 ? linkTo(name, website) : name} said
                <a title="{time}"></a>:
              </div>
              <div class="content">
                {text}
              </div>
            </div>   
          </div>
        </div>


The result would be as follows -- notice that the "comment" part of the
template has been repeated once for each item in the data.comment array:

        <div class="comments">  
          <div id="comments-template">
            <div class="comment">
              <div class="top">
                <a href="http://backham.com">David Beckham</a> said
                <a title="2008-09-07 12:28:33">2 hours ago</a>
              </div>
              <div class="text">
                I watched the euro finals on tv...
              </div>
            </div>   
            <div class="comment">
              <div class="top">
                Tuncay said
                <a title="2008-09-07 14:28:33">1 minute ago</a>
              </div>
              <div class="text">
                Me too
              </div>
            </div>   
          </div>
        </div>

The code to run the above example with jQuery is:

    var template = new JFill.Template('#comments-template');
    $('comments').jfill(template, data);

The code to run the above example without jQuery is:

    var template = new JFill.Template('comments-template');
    var container = document.getElementsByClassName('comments')[0];
    var result = template.fill(data);
    for (var i=0; i<result.length; i++) {
        container.appendChild(result[i]);
    }

    // since the example data is a single object rather than an array, the result
    // in this case will have only one child, so we could simply use
    //    container.appendChild(result[0]); 
    // but showing the more general code for reference.

For a working example, see example.html

### Credits

JFill is derived from Patroon by Matthias Georgi, which has a simple
structure and is implemented with small elegant code.  Changes have been
made to give a bit more flexibility and power while trying to mostly keep
the same basic simplicity and power.  However those changes affect the
functionality, and arguably the spirit, in a non-backwards-compatible way,
and so the library has been renamed.

The major differences in functionality are:
    - scoped in a JFill namespace rather than defining Template at global scope
