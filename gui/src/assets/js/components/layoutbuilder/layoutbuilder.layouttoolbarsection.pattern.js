/**
 * LayouttoolbarsectionPattern module.
 * 
 * @module patternlibrary.LayouttoolbarsectionPattern
 * 
 * @requires patternlibrary.Layouttoolbarsection
 */
var LayouttoolbarsectionPattern = {
	name  : 'pattern',
	items : [
		/*{
			type  : 'action',
			label : 'move element',
			action: '#move_element',
			icon  : 'fa fa-bars',
			events: {
			    click : LayoutbuilderClickdummy
			}
		},
		{   type  : 'separator' },*/
		{
			type  : 'action',
			label : 'view pattern doc',
			action: '#view_pattern_doc',
			icon  : 'fa fa-info',
			events: {
			    click : LayoutbuilderClickdummy
			}
		},
		{
			type  : 'action',
			label : 'edit pattern',
			action: '#edit_pattern',
			icon  : 'fa fa-edit',
			events: {
			    click : LayoutbuilderClickdummy
			}
		},
		{
			type  : 'action',
			label : 'remove pattern',
			action: '#remove_pattern',
			icon  : 'fa fa-minus',
			events: {
			    click : LayoutbuilderClickdummy
			}
		},
		{   type  : 'separator' },
		{
			type  : 'action',
			label : 'pattern settings',
			action: '#pattern_settings',
			icon  : 'fa fa-cogs',
			events: {
			    click : LayoutbuilderClickdummy
			}
		}
	]
};

