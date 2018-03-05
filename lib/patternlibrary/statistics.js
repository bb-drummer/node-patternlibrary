
function getStatistics () {
	
	return {
		
		patternscount   : Object.keys(this.listpatterns()).length || 0,
		
		categoriescount : Object.keys(this.listcategories()).length || 0,
		
		atomscount      : Object.keys(this.listpatterns('atom')).length || 0,
		
		moleculescount  : Object.keys(this.listpatterns('molecule')).length || 0,
		
		organismscount  : Object.keys(this.listpatterns('organism')).length || 0,
		
		templatescount : Object.keys(this.listpatterns('templates')).length || 0,
		
		pagescount     : Object.keys(this.listpatterns('pages')).length || 0,
		
	}
	
}

module.exports = getStatistics;