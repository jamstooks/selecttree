/**
  select_tree.js
  
	This jquery plugin manages multiple select inputs that have parent/child relationships.
	
	When an option from a parent is selected, the child is populated with
	specific options for that parent. Supports AJAX.

	Required Parameters :
	
	  id:
	    all select objects must have ids
	
	Required for the top-level parent only:

		data-callback:
			the callback function to populate the top-level select object
			
	Optional Parameters (for those selects with children):
		
    data-child:
      the id of the child object
			
		data-child-callback:
			the callback function used to populate the child select object
			these methods accept parentValue and callback parameters. the
			method can execute the callback with the list as a parameter when
			it's ready
			
	Example:
	  
    <select
			data-callback="populateAuthors"
			data-child="books"
			data-child-callback="populateBooks"
			name="author"
			id="author">
		</select>

		<select
			data-child="chapters"
			data-child-callback="populateChapters"
			name="books"
			id="books">
		</select>
		
		<select
			name="chapters"
			id="chapters">
		</select>
  		
    <script src="select_tree.js"></script>
		<script>

			$.populateAuthors = function(callback) {
				callback([
					["Hemmingway", 'h'],
					["Cuelo", 'c']
				]);
			};

			$.populateBooks = function(parentValue, callback) {
			  var optionList = []
			  if(parentValue == 'h') {
				  optionList = [
			      ['death in the afternoon', 1],
			      ['the sun also rises', 2]
			    ]
			  }
			  if(parentValue == 'c') {
				  optionList = [
			      ['by the river piedra', 1],
			      ['the alchemist', 2]
			    ]
			  }
			  callback(optionList);
			};

			$.populateChapters = function(parentValue, callback) {
			  var optionList = [];
			  for(var i=0; i<10; i++) {
				  optionList.push([i, i])
			  }
			  callback(optionList);
			};

			var options = {"initialValues": ['h', 1]};
			$("#author").selectTree(options);
		</script>
**/

!function($) {

  $.fn.selectTree = function(options) {

    this.options = options;

    this.collectBranches = function() {
      var index = 0
      this.branches = [{
        "select": this,
        "populateCallback": this.data('callback'),
        "populateChildCallback": this.data('childCallback'),
        "index": index
      }];

      var nextSelect = this;
      while (nextSelect.data('child') != undefined) {

        index++;

        nextSelect = $("#" + nextSelect.data('child'));
        var branch = {
          "index": index,
          "select": nextSelect
        };

        if (nextSelect.data('childCallback') != undefined) branch["populateChildCallback"] = nextSelect.data('childCallback');

        this.branches.push(branch);
        this.branches[index - 1].child = branch;
      }
    };

    this.populateFromList = function(branch, list) {

      // Remove existing values
      $(branch.select).find('option').remove();

      // Populate the branch's <select>
      if (list.length > 0) {
        $(branch.select).append($('<option value="">Select One</option>'));
        if (list != null) {
          for (var i = 0; i < list.length; i++) {
            $(branch.select).append($("<option></option>").attr("value", list[i][1]).text(list[i][0]));
          }
        }
      }
    };

    this.updateChildBranch = function(branch) {
      var tree = this;
      if (branch.select.val() != "") {
        $[branch.populateChildCallback](
        branch.select.val(), function(objectList) {
          tree.populateFromList(branch.child, objectList);
          // reset all other children
        });
      } else {
        tree.populateFromList(branch.child, []);
      }
      var nextBranch = branch.child;
      while (nextBranch.child) {
        nextBranch = nextBranch.child;
        nextBranch.select.find('option').remove();
      }
    };

    this.populateInitialValues = function() {

      this.initialValues = null;
      if (this.options.initialValues != undefined) {
        this.initialValues = this.options.initialValues;
      }

      // the top level gets populated initially with a callback
      var tree = this;
      $[tree.branches[0].populateCallback](function(optionList) {

        tree.populateFromList(tree.branches[0], optionList);

        // populate from initialValues if defined
        if (tree.initialValues != undefined && tree.initialValues.length > 0) {

          if (tree.branches.length >= tree.initialValues.length) {

            tree.branches[0].select.val(tree.initialValues[0]);

            // had to pull this out to isolate variables
            runPopulate = function(index, childBranch, parentBranch) {
              $[parentBranch.populateChildCallback](
              tree.initialValues[index - 1], function(optionList) {
                tree.populateFromList(childBranch, optionList);
                childBranch.select.val(tree.initialValues[index]);
              });
            }

            var max = tree.initialValues.length;
            // if there are any left at the end, populate them
            if (max < tree.branches.length) max++;

            for (var i = 1; i < max; i++) {
              runPopulate(i, tree.branches[i], tree.branches[i - 1]);
            }
          } else {
            console.log('invalid initial values');
          }
        }
      });
    };

    this.onChangeEvent = function(event) { /* This method handles a change event for any branch */
      var tree = event.data.selectTree;
      tree.updateChildBranch(event.data.branch);
    };

    /* initialize */

    this.collectBranches();
    this.populateInitialValues();

    // Bind the onchange event to each select
    for (var i = 0; i < this.branches.length; i++) {
      var branch = this.branches[i];
      if (branch.child != undefined) branch.select.on('change', null, {
        "branch": branch,
        "selectTree": this
      }, this.onChangeEvent)
    }

    /* end initialize */

  };
}(window.jQuery);
