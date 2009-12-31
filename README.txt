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

      + Conditional: If any element has an attribute jfill:if="condition", 
        JFill evalutes the condition expression in the context of the
        current data object; if the result is false or undefined, the
        element and its subtree will be pruned, otherwise the element is
        filled normally.  (The condition expression may optionally be
        enclosed in braces { } ).
 
      + Scoping: If any element has an attribute jfill:scope="subdata",
        JFill evalutes the subdata expression in the context of the current
        data object.  If the result is undefined, the element and its
        subtree will be pruned, same as for jfill:if.  Otherwise, JFill
        recursively fills the element's subtree in the context of the
        resulting object or array.  (The subdata expression may optionally
        be enclosed in braces { }.).

      + Metadata: In the evaluation context, a metadata object named jfill
        is available at each scope, having the following properties:

         jfill.data      - the object at the current scope

         jfill.parent    - the medata of the containing scope. undefined if
                           at the root scope.

         jfill.array     - if currently filling from an array, this
                           references the entire array.

         jfill.index     - if currently filling from an array, the value is
                           the index of the current object in jfill.array.
                           otherwise the value is undefined.

         jfill.oddEven   - the string "odd" if jfill.index is odd, "even"
                           if jfill.index is even.  undefined if not
                           filling from an array.

         jfill.isFirst   - true if filling from an array and at the first
                           item in the array, i.e. if jfill.index == 0.
                           undefined if not filling from an array.

         jfill.isLast    - true if filling from an array and at the last
                           item in the array, i.e. if jfill.index ==
                           jfill.array.length-1.  undefined if not filling
                           from an array.

         jfill.firstLast - if filling from an array, one of the strings:
                           "", "first", "last", or "first last", based on
                           isFirst and isLast.  undefined if not filling
                           from an array.

         For example, a template for an array row might include:
           <tr class="{jfill.firstLast} {jfill.oddEven}">...</tr>


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
            <div class="comment {jfill.firstLast}">
              <div class="top">
                <span class="index">{jfill.index+1}.</span>
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
            <div class="comment first">
              <div class="top">
                <span class="index">1.</span>
                <a href="http://backham.com">David Beckham</a> said
                <a title="2008-09-07 12:28:33">2 hours ago</a>
              </div>
              <div class="text">
                I watched the euro finals on tv...
              </div>
            </div>   
            <div class="comment last">
              <div class="top">
                <span class="index">2.</span>
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
    - put in a JFill namespace rather than defining Template at global scope
    - added "jfill" metadata object to interpolation context.
    - introduced jfill:scope attribute for scope context, rather than matching class names to object properties.
    - introduced jfill:if attribute for conditional parts of template
