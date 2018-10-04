/**
 * library plugin for reactome pathway search
 * This plugin only search human genes and pathways.
 */


module.exports = new function() {

    /** declarative attributes **/
    this.id = 'reactome.pathways';
    this.title = 'Reactome';
    this.subtitle = 'Pathway search (human)';
    this.tags = ['genes', 'proteins', 'pathways'];

    /** accompanying resources **/
    this.logo = 'Reactome_Isotype_Positive_25mm.png';
    this.info = 'reactome-info.html';

    // path to interactive pathway browser pages
    var reactome = 'https://reactome.org/';
    var browser = 'PathwayBrowser/#/';
    // path to detail pages on website
    var detail = 'content/detail/';
    // parts of api urls
    var api = "ContentService/";
    // endpoints for first and second round queries
    var endpoints = ['search/query?query=', 'data/pathways/low/diagram/entity/'];
    // connectors with the suffix for first and second round queries
    var joins = ['&', '?']
    // the species must be written in words because the search query does not accept 9606
    var suffix = 'species=Homo%20sapiens&format=json';

    /** signal whether or not plugin can process a query **/
    this.claim = function(x) {
        x = x.trim()
        if (x.length<2) return 0;
        var words = x.split(' ');
        if (words.length>2) return 0;
        var score = 1/words.length;
        // penalize some special characters
        ['%', '$', '#', '.', ';'].map(function(z) {
            score -= 0.3*(x.includes(z))
        })
        return Math.max(0, Math.min(0.9, score));
    };

    /** construct a url for an API call **/
    this.url = function(query, index) {
        var words = query.trim().split(' ');
        words = words.join("%20");
        return reactome + api + endpoints[index] + words + joins[index] + suffix;
    };

    /** transform a raw result from an API call into a display object **/
    this.process = function(data, index) {
        var result = JSON.parse(data)
        if (index==0) {
            result = result["results"][0];
            var entries = result["entries"];
            var hits = entries.filter(function(entry) {
                return entry["species"][0] == "Homo sapiens";
            })
            if (hits.length==0) {
                return {status: 0, data: "no hits"};
            }
            return {status: 0.5, data: hits[0]["id"]};
        }
        var hits = result.map(function(entry) {
            let name = entry["displayName"];
            let id = entry['stId'];
            return '<a href="'+reactome+browser+id+'">'+name+'</a>';
        });
        return { status: 1, data: hits}
    };

    /** construct a URL to an external information page **/
    this.external = function(query, index) {
        if (index==0) return null;
        return reactome + detail + query;
    };

}();