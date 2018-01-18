/**
 * LayouttoolbarsectionLayoutrow module.
 * 
 * @module patternlibrary.LayouttoolbarsectionLayoutrow
 * 
 * @requires patternlibrary.Layouttoolbarsection
 */
var LayouttoolbarsectionLayoutrow = {
	name  : 'layoutrow',
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
			label : 'add column',
			action: '#add_column',
			icon  : 'fa fa-plus',
			events: {
			    click : LayoutbuilderClickdummy
			}
		},
		{
			type  : 'action',
			label : 'remove row',
			action: '#remove_row',
			icon  : 'fa fa-minus',
			events: {
			    click : LayoutbuilderClickdummy
			}
		},
		{   type  : 'separator' },
		{
			type  : 'action',
			label : 'edit settings',
			action: '#edit_settings',
			icon  : 'fa fa-cogs',
			events: {
			    click : LayoutbuilderClickdummy
			}
		}
	]
};

