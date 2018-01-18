/**
 * Layoutbuilder Exception object
 * 
 * @module LayoutbuilderException
 */
class LayoutbuilderException {
	
    /**
     * Create a new instance of a LayoutbuilderException.
     * @class
     * @name LayoutbuilderException
     * @param {string} message - message of the exception decribing the occurence.
     * @param {number} code - optional message code, default = 0.
     */
	constructor(message, code = 0) {

	    this.name = "LayoutbuilderException";
	    this.message = message;
	}

	/**
	 * compose string output of LayoutbuilderException
	 * 
	 * @function
	 * @return {string}
	 */
    toString() { return this.name + ": " + this.message; }
    
};