# Jquery Select Tree - parent-child select elements

This jquery plugin manages multiple select inputs in a hierarchy that have parent/child relationships.

When an option from a parent is selected, the child is populated with specific options for that parent using a callback that can support AJAX.

Your best starting point is probably to look at the [example code](https://github.com/jamstooks/selecttree/blob/master/example.html), but here's how your top-level select object might look:

	<select
		data-callback="populateAuthors"
		data-child="books"
		data-child-callback="populateBooks"
		name="author"
		id="author">
	</select>
	
You can also see a live example over on [jsfiddle.net](http://jsfiddle.net/jamstooks/vNCT9/2/)

## Required Properties

####id:
all select objects must have ids

###Required for the top-level parent only:

####data-callback:
the callback function to populate the top-level select object
		
###Optional Parameters (for those selects with children):
	
####data-child:
the id of the child object
		
####data-child-callback:
the callback function used to populate the child select object
these methods accept parentValue and callback parameters. the
method can execute the callback with the list as a parameter when
it's ready