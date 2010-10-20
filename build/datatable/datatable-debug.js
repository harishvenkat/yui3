YUI.add('datatable-base', function(Y) {

var COLUMN = "column";

function Column(config) {
    Column.superclass.constructor.apply(this, arguments);
}

/**
 * Class name.
 *
 * @property NAME
 * @type String
 * @static
 * @final
 * @value "column"
 */
Column.NAME = "column";

/////////////////////////////////////////////////////////////////////////////
//
// Column Attributes
//
/////////////////////////////////////////////////////////////////////////////
Column.ATTRS = {
    id: {
        valueFn: "_defaultId",
        writeOnce: true
    },
    key: {
        valueFn: "_defaultKey"
    },
    field: {
        valueFn: "_defaultField"
    },
    label: {
        valueFn: "_defaultLabel"
    },
    keyIndex: {
        readOnly: true
    },
    parent: {
        readOnly: true
    },
    children: {
    },
    colspan: {
        readOnly: true
    },
    rowspan: {
        readOnly: true
    },
    thNode: {
        readOnly: true
    },
    thLinerNode: {
        readOnly: true
    },
    thLabelNode: {
        readOnly: true
    },
    abbr: {
        value: null
    },
    headers: {}, // set by Columnset code
    classnames: {
        readOnly: true,
        getter: "_getClassnames"
    },
    editor: {},
    formatter: {},
    
    // requires datatable-colresize
    resizeable: {},

    //requires datatable-sort
    sortable: {},
    hidden: {},
    width: {},
    minWidth: {},
    maxAutoWidth: {}
};

/* Column extends Widget */
Y.extend(Column, Y.Widget, {
    _defaultId: function() {
        return Y.guid();
    },

    _defaultKey: function(key) {
        return key || Y.guid();
    },

    _defaultField: function(field) {
        return field || this.get("key");
    },

    _defaultLabel: function(label) {
        return label || this.get("key");
    },

    initializer: function() {
    },

    destructor: function() {
    },

    syncUI: function() {
        this._uiSetAbbr(this.get("abbr"));
    },

    _afterAbbrChange: function (e) {
        this._uiSetAbbr(e.newVal);
    },
    
    _uiSetAbbr: function(val) {
        this._thNode.set("abbr", val);
    },
    /**
     * Returns classnames for Column.
     *
     * @method _getClassnames
     * @private
     */
    _getClassnames: function () {
        return Y.ClassNameManager.getClassName(COLUMN, this.get("id"));
        /*var allClasses;

        // Add CSS classes
        if(lang.isString(oColumn.className)) {
            // Single custom class
            allClasses = [oColumn.className];
        }
        else if(lang.isArray(oColumn.className)) {
            // Array of custom classes
            allClasses = oColumn.className;
        }
        else {
            // no custom classes
            allClasses = [];
        }

        // Hook for setting width with via dynamic style uses key since ID is too disposable
        allClasses[allClasses.length] = this.getId() + "-col-" +oColumn.getSanitizedKey();

        // Column key - minus any chars other than "A-Z", "a-z", "0-9", "_", "-", ".", or ":"
        allClasses[allClasses.length] = "yui-dt-col-" +oColumn.getSanitizedKey();

        var isSortedBy = this.get("sortedBy") || {};
        // Sorted
        if(oColumn.key === isSortedBy.key) {
            allClasses[allClasses.length] = isSortedBy.dir || '';
        }
        // Hidden
        if(oColumn.hidden) {
            allClasses[allClasses.length] = DT.CLASS_HIDDEN;
        }
        // Selected
        if(oColumn.selected) {
            allClasses[allClasses.length] = DT.CLASS_SELECTED;
        }
        // Sortable
        if(oColumn.sortable) {
            allClasses[allClasses.length] = DT.CLASS_SORTABLE;
        }
        // Resizeable
        if(oColumn.resizeable) {
            allClasses[allClasses.length] = DT.CLASS_RESIZEABLE;
        }
        // Editable
        if(oColumn.editor) {
            allClasses[allClasses.length] = DT.CLASS_EDITABLE;
        }

        // Addtnl classes, including First/Last
        if(aAddClasses) {
            allClasses = allClasses.concat(aAddClasses);
        }

        return allClasses.join(' ');*/
    }
});

Y.Column = Column;
var Lang = Y.Lang;

function Columnset(config) {
    Columnset.superclass.constructor.apply(this, arguments);
}

/**
 * Class name.
 *
 * @property NAME
 * @type String
 * @static
 * @final
 * @value "columnset"
 */
Columnset.NAME = "columnset";

/////////////////////////////////////////////////////////////////////////////
//
// Columnset Attributes
//
/////////////////////////////////////////////////////////////////////////////
Columnset.ATTRS = {
    columns: {
        setter: "_setColumns"
    },

    // DOM tree representation of all Columns
    tree: {
        readOnly: true,
        value: []
    },

    //TODO: is this necessary?
    // Flat representation of all Columns
    flat: {
        readOnly: true,
        value: []
    },

    // Hash of all Columns by ID
    hash: {
        readOnly: true,
        value: {}
    },

    // Flat representation of only Columns that are meant to display data
    keys: {
        readOnly: true,
        value: []
    }
};

/* Columnset extends Base */
Y.extend(Columnset, Y.Base, {
    _setColumns: function(columns) {
            return Y.clone(columns);
    },

    initializer: function() {

            // DOM tree representation of all Columns
            var tree = [],
            // Flat representation of all Columns
            flat = [],
            // Hash of all Columns by ID
            hash = {},
            // Flat representation of only Columns that are meant to display data
            keys = [],
            // Original definitions
            columns = this.get("columns"),

            self = this;

        // Internal recursive function to define Column instances
        function parseColumns(depth, nodeList, parent) {
            var i=0,
                len = nodeList.length,
                currentNode,
                column,
                currentChildren;

            // One level down
            depth++;

            // Create corresponding dom node if not already there for this depth
            if(!tree[depth]) {
                tree[depth] = [];
            }

            // Parse each node at this depth for attributes and any children
            for(; i<len; ++i) {
                currentNode = nodeList[i];

                currentNode = Lang.isString(currentNode) ? {key:currentNode} : currentNode;

                // Instantiate a new Column for each node
                column = new Y.Column(currentNode);

                // Cross-reference Column ID back to the original object literal definition
                currentNode.yuiColumnId = column.get("id");

                // Add the new Column to the flat list
                flat.push(column);

                // Add the new Column to the hash
                hash[column.get("id")] = column;

                // Assign its parent as an attribute, if applicable
                if(parent) {
                    column._set("parent", parent);
                }

                // The Column has descendants
                if(Lang.isArray(currentNode.children)) {
                    currentChildren = currentNode.children;
                    column._set("children", currentChildren);

                    self._setColSpans(column, currentNode);

                    self._cascadePropertiesToChildren(column, currentChildren);

                    // The children themselves must also be parsed for Column instances
                    if(!tree[depth+1]) {
                        tree[depth+1] = [];
                    }
                    parseColumns(depth, currentChildren, column);
                }
                // This Column does not have any children
                else {
                    column._set("keyIndex", keys.length);
                    column._set("colspan", 1);
                    keys.push(column);
                }

                // Add the Column to the top-down dom tree
                tree[depth].push(column);
            }
            depth--;
        }

        // Parse out Column instances from the array of object literals
        parseColumns(-1, columns);


        // Save to the Columnset instance
        this._set("tree", tree);
        this._set("flat", flat);
        this._set("hash", hash);
        this._set("keys", keys);

        this._setRowSpans();
        this._setHeaders();
    },

    destructor: function() {
    },

    _cascadePropertiesToChildren: function(oColumn, currentChildren) {
        var i = 0,
            len = currentChildren.length,
            child;

        // Cascade certain properties to children if not defined on their own
        for(; i<len; ++i) {
            child = currentChildren[i];
            if(oColumn.get("className") && (child.className === undefined)) {
                child.className = oColumn.get("className");
            }
            if(oColumn.get("editor") && (child.editor === undefined)) {
                child.editor = oColumn.get("editor");
            }
            if(oColumn.get("formatter") && (child.formatter === undefined)) {
                child.formatter = oColumn.get("formatter");
            }
            if(oColumn.get("resizeable") && (child.resizeable === undefined)) {
                child.resizeable = oColumn.get("resizeable");
            }
            if(oColumn.get("sortable") && (child.sortable === undefined)) {
                child.sortable = oColumn.get("sortable");
            }
            if(oColumn.get("hidden")) {
                child.hidden = true;
            }
            if(oColumn.get("width") && (child.width === undefined)) {
                child.width = oColumn.get("width");
            }
            if(oColumn.get("minWidth") && (child.minWidth === undefined)) {
                child.minWidth = oColumn.get("minWidth");
            }
            if(oColumn.get("maxAutoWidth") && (child.maxAutoWidth === undefined)) {
                child.maxAutoWidth = oColumn.get("maxAutoWidth");
            }
        }
    },

    _setColSpans: function(oColumn, currentNode) {
        // Determine COLSPAN value for this Column
        var terminalChildNodes = 0;

        function countTerminalChildNodes(ancestor) {
            var descendants = ancestor.children,
                i = 0,
                len = descendants.length;

            // Drill down each branch and count terminal nodes
            for(; i<len; ++i) {
                // Keep drilling down
                if(Lang.isArray(descendants[i].children)) {
                    countTerminalChildNodes(descendants[i]);
                }
                // Reached branch terminus
                else {
                    terminalChildNodes++;
                }
            }
        }
        countTerminalChildNodes(currentNode);
        oColumn._set("colspan", terminalChildNodes);
    },

    _setRowSpans: function() {
        // Determine ROWSPAN value for each Column in the dom tree
        function parseDomTreeForRowspan(tree) {
            var maxRowDepth = 1,
                currentRow,
                currentColumn,
                m,p;

            // Calculate the max depth of descendants for this row
            function countMaxRowDepth(row, tmpRowDepth) {
                tmpRowDepth = tmpRowDepth || 1;

                var i = 0,
                    len = row.length,
                    col;

                for(; i<len; ++i) {
                    col = row[i];
                    // Column has children, so keep counting
                    if(Lang.isArray(col.children)) {
                        tmpRowDepth++;
                        countMaxRowDepth(col.children, tmpRowDepth);
                        tmpRowDepth--;
                    }
                    // Column has children, so keep counting
                    else if(col.get && Lang.isArray(col.get("children"))) {
                        tmpRowDepth++;
                        countMaxRowDepth(col.get("children"), tmpRowDepth);
                        tmpRowDepth--;
                    }
                    // No children, is it the max depth?
                    else {
                        if(tmpRowDepth > maxRowDepth) {
                            maxRowDepth = tmpRowDepth;
                        }
                    }
                }
            }

            // Count max row depth for each row
            for(m=0; m<tree.length; m++) {
                currentRow = tree[m];
                countMaxRowDepth(currentRow);

                // Assign the right ROWSPAN values to each Column in the row
                for(p=0; p<currentRow.length; p++) {
                    currentColumn = currentRow[p];
                    if(!Lang.isArray(currentColumn.get("children"))) {
                        currentColumn._set("rowspan", maxRowDepth);
                    }
                    else {
                        currentColumn._set("rowspan", 1);
                    }
                }

                // Reset counter for next row
                maxRowDepth = 1;
            }
        }
        parseDomTreeForRowspan(this.get("tree"));
    },

    _setHeaders: function() {
        var headers, column,
            allKeys = this.get("keys"),
            i=0, len = allKeys.length;

        function recurseAncestorsForHeaders(headers, oColumn) {
            headers.push(oColumn.get("key"));
            //headers[i].push(oColumn.getSanitizedKey());
            if(oColumn.get("parent")) {
                recurseAncestorsForHeaders(headers, oColumn.get("parent"));
            }
        }
        for(; i<len; ++i) {
            headers = [];
            column = allKeys[i];
            recurseAncestorsForHeaders(headers, column);
            column._set("headers", headers.reverse().join(" "));
        }
    },

    getColumn: function() {
    }
});

Y.Columnset = Columnset;
/**
 * The DataTable widget provides a progressively enhanced DHTML control for
 * displaying tabular data across A-grade browsers.
 *
 * @module datatable
 */

/**
 * Provides the base DataTable implementation, which can be extended to add
 * additional functionality, such as sorting or scrolling.
 *
 * @module datatable
 * @submodule datatable-base
 */

/**
 * Base class for the DataTable widget.
 * @class DataSource.Base
 * @extends Widget
 * @constructor
 */
var YLang = Y.Lang,
    Ysubstitute = Y.Lang.substitute,
    YNode = Y.Node,
    Ycreate = YNode.create,
    YgetClassName = Y.ClassNameManager.getClassName,
    Ybind = Y.bind,

    DATATABLE = "datatable",
    
    FOCUS = "focus",
    KEYDOWN = "keydown",
    MOUSEOVER = "mouseover",
    MOUSEOUT = "mouseout",
    MOUSEUP = "mouseup",
    MOUSEDOWN = "mousedown",
    CLICK = "click",
    DOUBLECLICK = "doubleclick",

    CLASS_COLUMNS = YgetClassName(DATATABLE, "columns"),
    CLASS_DATA = YgetClassName(DATATABLE, "data"),
    CLASS_MSG = YgetClassName(DATATABLE, "msg"),
    CLASS_LINER = YgetClassName(DATATABLE, "liner"),
    CLASS_FIRST = YgetClassName(DATATABLE, "first"),
    CLASS_LAST = YgetClassName(DATATABLE, "last"),

    TEMPLATE_TABLE = '<table></table>',
    TEMPLATE_COL = '<col></col>',
    TEMPLATE_THEAD = '<thead class="'+CLASS_COLUMNS+'"></thead>',
    TEMPLATE_TBODY = '<tbody class="'+CLASS_DATA+'"></tbody>',
    TEMPLATE_TH = '<th id="{id}" rowspan="{rowspan}" colspan="{colspan}" class="{classnames}"><div class="'+CLASS_LINER+'">{value}</div></th>',
    TEMPLATE_TR = '<tr id="{id}"></tr>',
    TEMPLATE_TD = '<td headers="{headers}" class="{classnames}"><div class="'+CLASS_LINER+'">{value}</div></td>',
    TEMPLATE_VALUE = '{value}',
    TEMPLATE_MSG = '<tbody class="'+CLASS_MSG+'"></tbody>';


function DTBase(config) {
    DTBase.superclass.constructor.apply(this, arguments);
}

/////////////////////////////////////////////////////////////////////////////
//
// STATIC PROPERTIES
//
/////////////////////////////////////////////////////////////////////////////
Y.mix(DTBase, {

    /**
     * Class name.
     *
     * @property NAME
     * @type String
     * @static
     * @final
     * @value "dataSourceLocal"
     */
    NAME:  "dataTable",

/////////////////////////////////////////////////////////////////////////////
//
// ATTRIBUTES
//
/////////////////////////////////////////////////////////////////////////////
    ATTRS: {
        /**
        * @attribute columnset
        * @description Pointer to Columnset instance.
        * @type Array | Y.Columnset
        */
        columnset: {
            setter: "_setColumnset"
        },

        /**
        * @attribute recordset
        * @description Pointer to Recordset instance.
        * @type Array | Y.Recordset
        */
        recordset: {
            setter: "_setRecordset"
        },

        /*TODO
        * @attribute state
        * @description Internal state.
        * @readonly
        * @type
        */
        /*state: {
            value: new Y.State(),
            readOnly: true

        },*/

        /**
        * @attribute strings
        * @description The collection of localizable strings used to label
        * elements of the UI.
        * @type Object
        */
        strings: {
            valueFn: function() {
                return Y.Intl.get("datatable-base");
            }
        },

        /**
        * @attribute thValueTemplate
        * @description Tokenized markup template for TH value.
        * @type String
        * @default '{value}'
        */
        thValueTemplate: {
            value: TEMPLATE_VALUE
        },

        /**
        * @attribute tdValueTemplate
        * @description Tokenized markup template for TD value.
        * @type String
        * @default '{value}'
        */
        tdValueTemplate: {
            value: TEMPLATE_VALUE
        },

        /**
        * @attribute trTemplate
        * @description Tokenized markup template for TR node creation.
        * @type String
        * @default '<tr id="{id}"></tr>'
        */
        trTemplate: {
            value: TEMPLATE_TR
        }
    },

/////////////////////////////////////////////////////////////////////////////
//
// TODO: HTML_PARSER
//
/////////////////////////////////////////////////////////////////////////////
    HTML_PARSER: {
        /*caption: function (srcNode) {
            
        }*/
    }
});

/////////////////////////////////////////////////////////////////////////////
//
// PROTOTYPE
//
/////////////////////////////////////////////////////////////////////////////
Y.extend(DTBase, Y.Widget, {
    /**
    * @property thTemplate
    * @description Tokenized markup template for TH node creation.
    * @type String
    * @default '<th id="{id}" rowspan="{rowspan}" colspan="{colspan}"><div class="'+CLASS_LINER+'">{value}</div></th>'
    */
    thTemplate: TEMPLATE_TH,

    /**
    * @property tdTemplate
    * @description Tokenized markup template for TD node creation.
    * @type String
    * @default '<td headers="{headers}"><div class="'+CLASS_LINER+'">{value}</div></td>'
    */
    tdTemplate: TEMPLATE_TD,
    
    /**
    * @property _theadNode
    * @description Pointer to THEAD node.
    * @type Y.Node
    * @private
    */
    _theadNode: null,
    
    /**
    * @property _tbodyNode
    * @description Pointer to TBODY node.
    * @type Y.Node
    * @private
    */
    _tbodyNode: null,
    
    /**
    * @property _msgNode
    * @description Pointer to message display node.
    * @type Y.Node
    * @private
    */
    _msgNode: null,

    /////////////////////////////////////////////////////////////////////////////
    //
    // ATTRIBUTE HELPERS
    //
    /////////////////////////////////////////////////////////////////////////////
    /**
    * @property _setColumnset
    * @description Converts Array to Y.Columnset.
    * @param columns {Array | Y.Columnset}
    * @returns Y.Columnset
    * @private
    */
    _setColumnset: function(columns) {
        return YLang.isArray(columns) ? new Y.Columnset({columns:columns}) : columns;
    },

    /**
     * Updates the UI if changes are made to Columnset.
     *
     * @method _afterColumnsetChange
     * @param e {Event} Custom event for the attribute change.
     * @private
     */
    _afterColumnsetChange: function (e) {
        this._uiSetColumnset(e.newVal);
    },

    /**
    * @property _setRecordset
    * @description Converts Array to Y.Recordset.
    * @param records {Array | Y.Recordset}
    * @returns Y.Recordset
    * @private
    */
    _setRecordset: function(rs) {
        if(YLang.isArray(rs)) {
            rs = new Y.Recordset({records:rs});
        }

        rs.addTarget(this);
        return rs;
    },

    /**
    * @property _afterRecordsetChange
    * @description Adds bubble target.
    * @param records {Array | Y.Recordset}
    * @returns Y.Recordset
    * @private
    */
    _afterRecordsetChange: function (e) {
        this._uiSetRecordset(e.newVal);
    },


    /////////////////////////////////////////////////////////////////////////////
    //
    // METHODS
    //
    /////////////////////////////////////////////////////////////////////////////
    /**
    * Initializer.
    *
    * @method initializer
    * @param config {Object} Config object.
    * @private
    */
    initializer: function(config) {
    },

    /**
    * Destructor.
    *
    * @method destructor
    * @private
    */
    destructor: function() {
         this.get("recordset").removeTarget(this);
    },

    ////////////////////////////////////////////////////////////////////////////
    //
    // RENDER
    //
    ////////////////////////////////////////////////////////////////////////////

    /**
    * Renders UI.
    *
    * @method renderUI
    * @private
    */
    renderUI: function() {
        var ok =
            // TABLE
            this._addTableNode(this.get("contentBox")) &&
            // COLGROUP
            this._addColgroupNode(this._tableNode) &&
            // THEAD
            this._addTheadNode(this._tableNode) &&
            // Primary TBODY
            this._addTbodyNode(this._tableNode) &&
            // Message TBODY
            this._addMessageNode(this._tableNode) &&
            // CAPTION
            this._addCaptionNode(this._tableNode);
   },

    /**
    * Creates and attaches TABLE element to given container.
    *
    * @method _addTableNode
    * @param containerNode {Y.Node} Parent node.
    * @protected
    * @returns Y.Node
    */
    _addTableNode: function(containerNode) {
        if (!this._tableNode) {
            this._tableNode = containerNode.appendChild(Ycreate(TEMPLATE_TABLE));
        }
        return this._tableNode;
    },

    /**
    * Creates and attaches COLGROUP element to given TABLE.
    *
    * @method _addColgroupNode
    * @param tableNode {Y.Node} Parent node.
    * @protected
    * @returns Y.Node
    */
    _addColgroupNode: function(tableNode) {
        // Add COLs to DOCUMENT FRAGMENT
        var len = this.get("columnset").get("keys").length,
            i = 0,
            allCols = ["<colgroup>"];

        for(; i<len; ++i) {
            allCols.push(TEMPLATE_COL);
        }

        allCols.push("</colgroup>");

        // Create COLGROUP
        this._colgroupNode = tableNode.insertBefore(Ycreate(allCols.join("")), tableNode.get("firstChild"));

        return this._colgroupNode;
    },

    /**
    * Creates and attaches THEAD element to given container.
    *
    * @method _addTheadNode
    * @param tableNode {Y.Node} Parent node.
    * @protected
    * @returns Y.Node
    */
    _addTheadNode: function(tableNode) {
        if(tableNode) {
            this._theadNode = tableNode.insertBefore(Ycreate(TEMPLATE_THEAD), this._colgroupNode.next());
            return this._theadNode;
        }
    },

    /**
    * Creates and attaches TBODY element to given container.
    *
    * @method _addTbodyNode
    * @param tableNode {Y.Node} Parent node.
    * @protected
    * @returns Y.Node
    */
    _addTbodyNode: function(tableNode) {
        this._tbodyNode = tableNode.appendChild(Ycreate(TEMPLATE_TBODY));
        return this._tbodyNode;
    },

    /**
    * Creates and attaches message display element to given container.
    *
    * @method _addMessageNode
    * @param tableNode {Y.Node} Parent node.
    * @protected
    * @returns Y.Node
    */
    _addMessageNode: function(tableNode) {
        this._msgNode = tableNode.insertBefore(Ycreate(TEMPLATE_MSG), this._tbodyNode);
        return this._msgNode;
    },

    /**
    * Creates and attaches CAPTION element to given container.
    *
    * @method _addCaptionNode
    * @param tableNode {Y.Node} Parent node.
    * @protected
    * @returns Y.Node
    */
    _addCaptionNode: function(tableNode) {
        //TODO: node.createCaption
        this._captionNode = tableNode.invoke("createCaption");
        return this._captionNode;
    },

    ////////////////////////////////////////////////////////////////////////////
    //
    // BIND
    //
    ////////////////////////////////////////////////////////////////////////////

    /**
    * Binds events.
    *
    * @method bindUI
    * @private
    */
    bindUI: function() {
        var tableNode = this._tableNode,
            contentBox = this.get("contentBox"),
            theadFilter = "thead."+CLASS_COLUMNS+">tr>th",
            tbodyFilter ="tbody."+CLASS_DATA+">tr>td",
            msgFilter = "tbody."+CLASS_MSG+">tr>td";
            
        // Define custom events that wrap DOM events. Simply pass through DOM
        // event facades.
        //TODO: do we need queuable=true?
        //TODO: All the other events.
        this.publish("theadCellClick", {defaultFn: this._defTheadCellClickFn, emitFacade:false, queuable:true});
        this.publish("theadRowClick", {defaultFn: this._defTheadRowClickFn, emitFacade:false, queuable:true});
        this.publish("theadClick", {defaultFn: this._defTheadClickFn, emitFacade:false, queuable:true});

        // Bind to THEAD DOM events
        tableNode.delegate(FOCUS, this._onDomEvent, theadFilter, this, "theadCellFocus");
        tableNode.delegate(KEYDOWN, this._onDomEvent, theadFilter, this, "theadCellKeydown");
        tableNode.delegate(MOUSEOVER, this._onDomEvent, theadFilter, this, "theadCellMousedown");
        tableNode.delegate(MOUSEOUT, this._onDomEvent, theadFilter, this, "theadCellMouseout");
        tableNode.delegate(MOUSEUP, this._onDomEvent, theadFilter, this, "theadCellMouseup");
        tableNode.delegate(MOUSEDOWN, this._onDomEvent, theadFilter, this, "theadCellMousedown");
        tableNode.delegate(CLICK, this._onDomEvent, theadFilter, this, "theadCellClick");
        // Since we can't listen for click and dblclick on the same element...
        contentBox.delegate(DOUBLECLICK, this._onEvent, theadFilter, this, "theadCellDoubleclick");

        // Bind to TBODY DOM events
        tableNode.delegate(FOCUS, this._onDomEvent, theadFilter, this, "tbodyCellFocus");
        tableNode.delegate(KEYDOWN, this._onDomEvent, theadFilter, this, "tbodyCellKeydown");
        tableNode.delegate(MOUSEOVER, this._onDomEvent, theadFilter, this, "tbodyCellMouseover");
        tableNode.delegate(MOUSEOUT, this._onDomEvent, theadFilter, this, "tbodyCellMouseout");
        tableNode.delegate(MOUSEUP, this._onDomEvent, theadFilter, this, "tbodyCellMouseup");
        tableNode.delegate(MOUSEDOWN, this._onDomEvent, theadFilter, this, "tbodyCellMousedown");
        tableNode.delegate(CLICK, this._onDomEvent, theadFilter, this, "tbodyCellClick");
        // Since we can't listen for click and dblclick on the same element...
        contentBox.delegate(DOUBLECLICK, this._onEvent, theadFilter, this, "tbodyCellDoubleclick");

        // Bind to message TBODY DOM events
        tableNode.delegate(FOCUS, this._onDomEvent, msgFilter, this, "msgCellFocus");
        tableNode.delegate(KEYDOWN, this._onDomEvent, msgFilter, this, "msgCellKeydown");
        tableNode.delegate(MOUSEOVER, this._onDomEvent, msgFilter, this, "msgCellMouseover");
        tableNode.delegate(MOUSEOUT, this._onDomEvent, msgFilter, this, "msgCellMouseout");
        tableNode.delegate(MOUSEUP, this._onDomEvent, msgFilter, this, "msgCellMouseup");
        tableNode.delegate(MOUSEDOWN, this._onDomEvent, msgFilter, this, "msgCellMousedown");
        tableNode.delegate(CLICK, this._onDomEvent, msgFilter, this, "msgCellClick");
        // Since we can't listen for click and dblclick on the same element...
        contentBox.delegate(DOUBLECLICK, this._onDomEvent, msgFilter, this, "msgCellDoubleclick");
    },
    
    /**
    * On DOM event, fires corresponding custom event.
    *
    * @method _onDomEvent
    * @param e {DOMEvent} The original DOM event facade.
    * @param type {String} Corresponding custom event to fire.
    * @private
    */
    _onDomEvent: function(e, type) {
        this.fire(type, e);
    },

    //TODO: abstract this out
    _defTheadCellClickFn: function(e) {
        this.fire("theadRowClick", e);
    },

    _defTheadRowClickFn: function(e) {
        this.fire("theadClick", e);
    },

    _defTheadClickFn: function(e) {
    },

    ////////////////////////////////////////////////////////////////////////////
    //
    // SYNC
    //
    ////////////////////////////////////////////////////////////////////////////

    /**
    * Syncs UI to intial state.
    *
    * @method syncUI
    * @private
    */
    syncUI: function() {
        // THEAD ROWS
        this._uiSetColumnset(this.get("columnset"));
        // DATA ROWS
        this._uiSetRecordset(this.get("recordset"));
        // STRINGS
        this._uiSetStrings(this.get("strings"));
    },

    /**
     * Updates the UI if changes are made to any of the strings in the strings
     * attribute.
     *
     * @method _afterStringsChange
     * @param e {Event} Custom event for the attribute change.
     * @protected
     */
    _afterStringsChange: function (e) {
        this._uiSetStrings(e.newVal);
    },

    /**
     * Updates all strings.
     *
     * @method _uiSetStrings
     * @param strings {Object} Collection of new strings.
     * @protected
     */
    _uiSetStrings: function (strings) {
        this._uiSetSummary(strings.summary);
        this._uiSetCaption(strings.caption);
    },

    /**
     * Updates summary.
     *
     * @method _uiSetSummary
     * @param val {String} New summary.
     * @protected
     */
    _uiSetSummary: function(val) {
        this._tableNode.set("summary", val);
    },

    /**
     * Updates caption.
     *
     * @method _uiSetCaption
     * @param val {String} New caption.
     * @protected
     */
    _uiSetCaption: function(val) {
        this._captionNode.setContent(val);
    },


    ////////////////////////////////////////////////////////////////////////////
    //
    // THEAD/COLUMNSET FUNCTIONALITY
    //
    ////////////////////////////////////////////////////////////////////////////
        /**
     * Updates THEAD.
     *
     * @method _uiSetColumnset
     * @param cs {Y.Columnset} New Columnset.
     * @protected
     */
    _uiSetColumnset: function(cs) {
        var tree = cs.get("tree"),
            thead = this._theadNode,
            i = 0,
            len = tree.length;
            
        //TODO: move thead off dom
        thead.get("children").remove(true);

        // Iterate tree of columns to add THEAD rows
        for(; i<len; ++i) {
            this._addTheadTrNode({thead:thead, columns:tree[i]}, (i === 0), (i === len-1));
        }

        // Column helpers needs _theadNode to exist
        //this._createColumnHelpers();

        
        //TODO: move thead on dom

     },
     
    /**
    * Creates and attaches header row element.
    *
    * @method _addTheadTrNode
    * @param o {Object} {thead, columns}.
    * @param isFirst {Boolean} Is first row.
    * @param isFirst {Boolean} Is last row.
    * @protected
    */
     _addTheadTrNode: function(o, isFirst, isLast) {
        o.tr = this._createTheadTrNode(o, isFirst, isLast);
        this._attachTheadTrNode(o);
     },
     

    /**
    * Creates header row element.
    *
    * @method _createTheadTrNode
    * @param o {Object} {thead, columns}.
    * @param isFirst {Boolean} Is first row.
    * @param isLast {Boolean} Is last row.
    * @protected
    * @returns Y.Node
    */
    _createTheadTrNode: function(o, isFirst, isLast) {
        //TODO: custom classnames
        var tr = Ycreate(Ysubstitute(this.get("trTemplate"), o)),
            i = 0,
            columns = o.columns,
            len = columns.length,
            column;

         // Set FIRST/LAST class
        if(isFirst) {
            tr.addClass(CLASS_FIRST);
        }
        if(isLast) {
            tr.addClass(CLASS_LAST);
        }

        for(; i<len; ++i) {
            column = columns[i];
            this._addTheadThNode({value:column.get("label"), column: column, tr:tr});
        }

        return tr;
    },

    /**
    * Attaches header row element.
    *
    * @method _attachTheadTrNode
    * @param o {Object} {thead, columns, tr}.
    * @protected
    */
    _attachTheadTrNode: function(o) {
        o.thead.appendChild(o.tr);
    },

    /**
    * Creates and attaches header cell element.
    *
    * @method _addTheadThNode
    * @param o {Object} {value, column, tr}.
    * @protected
    */
    _addTheadThNode: function(o) {
        o.th = this._createTheadThNode(o);
        this._attachTheadThNode(o);
    },

    /**
    * Creates header cell element.
    *
    * @method _createTheadThNode
    * @param o {Object} {value, column, tr}.
    * @protected
    * @returns Y.Node
    */
    _createTheadThNode: function(o) {
        var column = o.column;
        
        // Populate template object
        o.id = column.get("id");//TODO: validate 1 column ID per document
        o.colspan = column.get("colspan");
        o.rowspan = column.get("rowspan");
        //TODO o.abbr = column.get("abbr");
        o.classnames = column.get("classnames");
        o.value = Ysubstitute(this.get("thValueTemplate"), o);

        /*TODO
        // Clear minWidth on hidden Columns
        if(column.get("hidden")) {
            //this._clearMinWidth(column);
        }
        */
        
        //column._set("thNode", o.th);

        return Ycreate(Ysubstitute(this.thTemplate, o));
    },

    /**
    * Attaches header cell element.
    *
    * @method _attachTheadTrNode
    * @param o {Object} {value, column, tr}.
    * @protected
    */
    _attachTheadThNode: function(o) {
        o.tr.appendChild(o.th);
    },

    ////////////////////////////////////////////////////////////////////////////
    //
    // TBODY/RECORDSET FUNCTIONALITY
    //
    ////////////////////////////////////////////////////////////////////////////
    _uiSetRecordset: function(rs) {
        var i = 0,//TODOthis.get("state.offsetIndex")
            len = rs.getLength(), //TODOthis.get("state.pageLength")
            o = {tbody:this._tbodyNode}; //TODO: not sure best time to do this -- depends on sdt

        // Iterate recordset to use existing or add new tr
        for(; i<len; ++i) {
            o.record = rs.getRecord(i);
            o.rowindex = i;
            this._addTbodyTrNode(o); //TODO: sometimes rowindex != recordindex
        }
    },

    _addTbodyTrNode: function(o) {
        var tbody = o.tbody,
            record = o.record;
        o.tr = tbody.one("#"+record.get("id")) || this._createTbodyTrNode(o);
        this._attachTbodyTrNode(o);
    },

    _createTbodyTrNode: function(o) {
        var tr = Ycreate(Ysubstitute(this.get("trTemplate"), {id:o.record.get("id")})),
            i = 0,
            allKeys = this.get("columnset").get("keys"),
            len = allKeys.length,
            column;

        o.tr = tr;
        
        for(; i<len; ++i) {
            o.column = allKeys[i];
            this._addTbodyTdNode(o);
        }
        
        return tr;
    },

    _attachTbodyTrNode: function(o) {
        var tbody = o.tbody,
            tr = o.tr,
            record = o.record,
            index = o.rowindex,
            nextSibling = tbody.get("children").item(index) || null;

        tbody.insertBefore(tr, nextSibling);
    },

    _addTbodyTdNode: function(o) {
        o.td = this._createTbodyTdNode(o);
        this._attachTbodyTdNode(o);
    },
    
    _createTbodyTdNode: function(o) {
        var column = o.column;
        //TODO: attributes? or methods?
        o.headers = column.get("headers");
        o.classnames = column.get("classnames");
        o.value = this.formatDataCell(o);
        return Ycreate(Ysubstitute(this.tdTemplate, o));
    },
    
    _attachTbodyTdNode: function(o) {
        o.tr.appendChild(o.td);
    },

    formatDataCell: function(o) {
        var record = o.record;
        o.data = record.get("data");
        o.value = record.getValue(o.column.get("key"));
        return Ysubstitute(this.get("tdValueTemplate"), o);
    }
});

Y.namespace("DataTable").Base = DTBase;


}, '@VERSION@' ,{lang:['en'], requires:['intl','substitute','widget','recordset']});
YUI.add('datatable-sort', function(Y) {

//TODO: break out into own component
var //getClassName = Y.ClassNameManager.getClassName,
    COMPARE = Y.ArraySort.compare,

    //DATATABLE = "datatable",
    ASC = "asc",
    DESC = "desc",
    //CLASS_ASC = getClassName(DATATABLE, "asc"),
    //CLASS_DESC = getClassName(DATATABLE, "desc"),
    CLASS_SORTABLE = Y.ClassNameManager.getClassName("datatable", "sortable"),

    //TODO: Don't use hrefs - use tab/arrow/enter
    TEMPLATE_TH_LINK = '<a class="{link_class}" title="{link_title}" href="{link_href}">{value}</a>';


function DataTableSort() {
    DataTableSort.superclass.constructor.apply(this, arguments);
}

Y.mix(DataTableSort, {
    NS: "sort",

    NAME: "dataTableSort",

    ATTRS: {
        trigger: {
            value: "theadCellClick",
            writeOnce: "initOnly"
        },
        
        sortedBy: {
            value: null
        }
    }
});

Y.extend(DataTableSort, Y.Plugin.Base, {
    thLinkTemplate: TEMPLATE_TH_LINK,

    initializer: function(config) {
        var dt = this.get("host");
        dt.get("recordset").plug(Y.Plugin.RecordsetSort, {dt: dt});
        dt.get("recordset").sort.addTarget(dt);
        
        // Wrap link around TH value
        this.doBefore("_createTheadThNode", this._beforeCreateTheadThNode);
        
        // Add class
        this.doBefore("_attachTheadThNode", function(o) {
           o.th.addClass(CLASS_SORTABLE);
        });

        // Attach click handlers
        dt.on(this.get("trigger"), this._onEventSortColumn);

        // Attach UI hooks
        dt.after("recordsetSort:sort", function() {
            dt._uiSetRecordset(dt.get("recordset"));
        });
        dt.after("sortedByChangeEvent", function() {
            alert('ok');
        });

        //TODO
        //dt.after("recordset:mutation", function() {//reset sortedBy});
        
        //TODO
        //add Column sortFn ATTR
        
        // Update UI after the fact (plug-then-render case)
        if(dt.get("rendered")) {
            dt._uiSetColumnset(dt.get("columnset"));
        }
    },

    _beforeCreateTheadThNode: function(o) {
        if(o.column.get("sortable")) {
            o.value = Y.substitute(this.thLinkTemplate, {
                link_class: "foo",
                link_title: "bar",
                link_href: "bat",
                value: o.value
            });
        }
    },

    _onEventSortColumn: function(e) {
        e.halt();
        //TODO: normalize e.currentTarget to TH
        var column = this.get("columnset").get("hash")[e.currentTarget.get("id")],
            field = column.get("field"),
            prevSortedBy = this.get("sortedBy"),
            dir = (prevSortedBy &&
                prevSortedBy.field === field &&
                prevSortedBy.dir === ASC) ? DESC : ASC,
            sorter = column.get("sortFn");
        if(column.get("sortable")) {
            this.get("recordset").sort.sort(field, dir === DESC, sorter);
            this.set("sortedBy", {field: field, dir: dir});
        }
    }
});

Y.namespace("Plugin").DataTableSort = DataTableSort;





}, '@VERSION@' ,{requires:['plugin','datatable-base','recordset-sort'], lang:['en']});
YUI.add('datatable-colresize', function(Y) {

var GETCLASSNAME = Y.ClassNameManager.getClassName,

    DATATABLE = "datatable",

    //CLASS_RESIZEABLE = GETCLASSNAME(DATATABLE, "resizeable"),
    CLASS_LINER = GETCLASSNAME(DATATABLE, "liner"),
    TEMPLATE_LINER = '<div class="'+CLASS_LINER+'">{value}</div>';

function DataTableColResize() {
    DataTableColResize.superclass.constructor.apply(this, arguments);
}

Y.mix(DataTableColResize, {

    NS: "colresize",

    NAME: "dataTableColResize",

    ATTRS: {

    }
});

Y.extend(DataTableColResize, Y.Plugin.Base, {
    thLinerTemplate: TEMPLATE_LINER,

    tdLinerTemplate: TEMPLATE_LINER,

    initializer: function(config) {
        this.get("host").thTemplate = Y.substitute(this.get("host").thTemplate, {value: this.thLinerTemplate});
        this.get("host").tdTemplate = Y.substitute(this.get("host").tdTemplate, {value: this.tdLinerTemplate});


        //TODO Set Column width...
        /*if(oColumn.width) {
            // Validate minWidth
            var nWidth = (oColumn.minWidth && (oColumn.width < oColumn.minWidth)) ?
                    oColumn.minWidth : oColumn.width;
            // ...for fallback cases
            if(DT._bDynStylesFallback) {
                elTh.firstChild.style.overflow = 'hidden';
                elTh.firstChild.style.width = nWidth + 'px';
            }
            // ...for non fallback cases
            else {
                this._setColumnWidthDynStyles(oColumn, nWidth + 'px', 'hidden');
            }
        }*/
    }
});

Y.namespace('Plugin').DataTableColResize = DataTableColResize;


}, '@VERSION@' ,{requires:['plugin','dd','datatable-base']});
YUI.add('datatable-scroll', function(Y) {

var YDo = Y.Do,
	YNode = Y.Node,
	YLang = Y.Lang,
	YUA = Y.UA,
	YgetClassName = Y.ClassNameManager.getClassName,
	DATATABLE = "datatable",
	CLASS_HEADER = YgetClassName(DATATABLE, "hd"),
	CLASS_BODY = YgetClassName(DATATABLE, "bd"),
	CLASS_LINER = YgetClassName(DATATABLE, "liner"),
	CLASS_SCROLLABLE = YgetClassName(DATATABLE, "scrollable"),
	CONTAINER_HEADER = '<div class="'+CLASS_HEADER+'"></div>',
	CONTAINER_BODY = '<div class="'+CLASS_BODY+'"></div>',
	TEMPLATE_TH = '<th id="{id}" rowspan="{rowspan}" colspan="{colspan}"><div class="'+CLASS_LINER+'" style="width:100px">{value}</div></th>',
	TEMPLATE_TD = '<td headers="{headers}"><div class="'+CLASS_LINER+'" style="width:100px">{value}</div></td>';
	

function DataTableScroll() {
    DataTableScroll.superclass.constructor.apply(this, arguments);
}

Y.mix(DataTableScroll, {
    NS: "scroll",

    NAME: "dataTableScroll",

    ATTRS: {
        width: {
			value: undefined
		},
		height: {
			value: undefined
		},
		
		scroll: {
			value: 'y'
		},
		
		COLOR_COLUMNFILLER: {
			value: '#f2f2f2',
			validator: YLang.isString,
			setter: function(param) {
				if (this._headerContainerNode) {
					this._headerContainerNode.setStyle('backgroundColor', param);
				}
			}
		}
    }
});

Y.extend(DataTableScroll, Y.Plugin.Base, {
	
	tdTemplate: TEMPLATE_TD,
	
	thTemplate: TEMPLATE_TH,
	
	_parentTableNode: null,
	
	_parentTheadNode: null,
	
	_parentTbodyNode: null,
	
	_parentMsgNode: null,
	
	_parentContainer: null,
	
	_bodyContainerNode: null,
	
	_headerContainerNode: null,
	
	initializer: function(config) {
        var dt = this.get("host");
		this._parentContainer = dt.get('contentBox');
		this._parentContainer.addClass(CLASS_SCROLLABLE);
		this._setUpNodes();
	},
	
	/////////////////////////////////////////////////////////////////////////////
	//
	// Set up Table Nodes
	//
	/////////////////////////////////////////////////////////////////////////////
				
	_setUpNodes: function() {
		var dt = this.get('host');
		
		this.afterHostMethod("_addTableNode", this._setUpParentTableNode);
		this.afterHostMethod("_addTheadNode", this._setUpParentTheadNode); 
		this.afterHostMethod("_addTbodyNode", this._setUpParentTbodyNode);
		this.afterHostMethod("_addMessageNode", this._setUpParentMessageNode);
       	
		this.afterHostMethod("renderUI", this.renderUI);
		this.afterHostMethod("syncUI", this.syncUI);
		
		this.beforeHostMethod('_attachTheadThNode', this._attachTheadThNode);
		this.beforeHostMethod('_attachTbodyTdNode', this._attachTbodyTdNode);        
	},
		
	
	_setUpParentTableNode: function() {
		this._parentTableNode = this.get('host')._tableNode;
		//console.log(this._parentTableNode);
	},
	
	_setUpParentTheadNode: function() {
		this._parentTheadNode = this.get('host')._theadNode;
		//console.log(this._parentTheadNode);
	},
	_setUpParentTbodyNode: function() {
		this._parentTbodyNode = this.get('host')._tbodyNode;
		//console.log(this._parentTbodyNode);
	},
	_setUpParentMessageNode: function() {
		this._parentMsgNode = this.get('host')._msgNode;
		//console.log(this._parentMsgNode);
	},
	
	/////////////////////////////////////////////////////////////////////////////
	//
	// Renderer
	//
	/////////////////////////////////////////////////////////////////////////////
	
	renderUI: function() {
		this._createBodyContainer();
		this._createHeaderContainer();
		this._setContentBoxDimenions();
	},
	
	syncUI: function() {
		this._syncScroll();
		this._syncTh();
	},
	
	_syncTh: function() {
		var th = YNode.all('#'+this._parentContainer.get('id')+' .yui3-datatable-hd table thead th'),
			//td = this._parentTbodyNode.get('children')._nodes[0].children,
			td = YNode.all('#'+this._parentContainer.get('id')+' .yui3-datatable-bd table tr td'),
			i,
			len,
			thWidth, tdWidth, thLiner, tdLiner;
			
			for (i=0, len = th.size(); i<len; i++) {
				
				//If a width has not been already set on the TD:
				//if (td.item(i).get('firstChild').getStyle('width') === "auto") {
					
					thLiner = th.item(i).get('firstChild'); //TODO: use liner API
					tdLiner = td.item(i).get('firstChild');
					
					thWidth = thLiner.get('clientWidth');
					tdWidth = td.item(i).get('clientWidth');
										
					//if TH is bigger than TD, enlarge TD Liner
					if (thWidth > tdWidth) {
						tdLiner.setStyle('width', thWidth - 20 + 'px');
					}
					
					//if TD is bigger than TH, enlarge TH Liner
					else if (tdWidth > thWidth) {
						thLiner.setStyle('width', tdWidth - 20 + 'px');
					}
				}

			//}
			
	},
	
	//Before attaching the Th nodes, add the appropriate width to the liner divs.
	_attachTheadThNode: function(o) {
		var width = o.column.get('width') || "auto";
		o.th.get('firstChild').setStyle('width', width);
		return o;
	},
	
	//Before attaching the td nodes, add the appropriate width to the liner divs.
	_attachTbodyTdNode: function(o) {
		var width = o.column.get('width') || "auto";
		o.td.get('firstChild').setStyle('width', width);
		o.td.setStyle('width', width);
		return o;
	},
	
	_createBodyContainer: function() {
		var	bd = YNode.create(CONTAINER_BODY),
			onScrollFn = Y.bind("_onScroll", this);
		this._bodyContainerNode = bd;		
		this._setOverflowForTbody();
		bd.appendChild(this._parentTableNode);
		this._parentContainer.appendChild(bd);
		bd.on('scroll', onScrollFn);
	},
	
	_createHeaderContainer: function() {
		var hd = YNode.create(CONTAINER_HEADER),
			tbl = YNode.create('<table></table>');
		this._headerContainerNode = hd;
		
		hd.setStyle('backgroundColor',this.get("COLOR_COLUMNFILLER"));
		this._setOverflowForThead();
		tbl.appendChild(this._parentTheadNode);
		hd.appendChild(tbl);
		this._parentContainer.prepend(hd);
		
	},
	
	_setOverflowForTbody: function() {
		var dir = this.get('scroll'),
			w = this.get('width') || "",
			h = this.get('height') || "",
			el = this._bodyContainerNode,
			styles = {'width':"", 'height':h};
				
		if (dir === 'x') {
			styles['overflowY'] = 'hidden';
			styles['width'] = w;
			//el.setStyles({'overflow-y':'hidden'});
		}
		else if (dir === 'y') {
			//el.setStyles({'overflow-x':'hidden', "width": ""});
			styles['overflowX'] = 'hidden';
		}
		
		//assume xy
		else {
			styles['width'] = w;
		}
		
		el.setStyles(styles);
		return el;
	},
	
	_setOverflowForThead: function() {
		var dir = this.get('scroll'),
			w = this.get('width'),
			el = this._headerContainerNode;
		
		if (dir !== 'y') {
			el.setStyles({'width': w, 'overflow': 'hidden'});
		}
	},
	
	_setContentBoxDimenions: function() {
		if (this.get('scroll') === 'y') {
			this._parentContainer.setStyle('width', 'auto');
		}
	},
	
	/////////////////////////////////////////////////////////////////////////////
	//
	// Scroll Syncing
	//
	/////////////////////////////////////////////////////////////////////////////
	_onScroll: function() {
		this._headerContainerNode.set('scrollLeft', this._bodyContainerNode.get('scrollLeft'));
	},
	
	_syncScroll : function() {
		    this._syncScrollX();
		    this._syncScrollY();
		    this._syncScrollOverhang();
		 				    if(YUA.opera) {
			 				    	// Bug 1925874
			 				    	this._headerContainerNode.set('scrollLeft', this._bodyContainerNode.get('scrollLeft'));
			 				    		if(!this.get("width")) {
			 				    	    	// Bug 1926125
			 				    	        document.body.style += '';
			 				    	    }
			 		}
	},
	
		/**
		 * Snaps container width for y-scrolling tables.
		 *
		 * @method _syncScrollY
		 * @private
		 */
	_syncScrollY : function() {
		var tBody = this._parentTbodyNode,
		    tBodyContainer = this._bodyContainerNode,
			w;
		    // X-scrolling not enabled
			if(!this.get("width")) {
		        // Snap outer container width to content
		        w = (tBodyContainer.get('scrollHeight') > tBodyContainer.get('clientHeight')) ?
		    	// but account for y-scrollbar since it is visible
					(tBody.get('parentNode').get('clientWidth') + 19) + "px" :
		     		// no y-scrollbar, just borders
            		(tBody.get('parentNode').get('clientWidth') + 2) + "px";
				this._parentContainer.setStyle('width', w);
		}
	},
		
		/**
		 * Snaps container height for x-scrolling tables in IE. Syncs message TBODY width. 
		 * Taken from YUI2 ScrollingDataTable.js
		 *
		 * @method _syncScrollX
		 * @private
		 */
	_syncScrollX: function() {
		var tBody = this._parentTbodyNode,
			tBodyContainer = this._bodyContainerNode,
			w;
			this._headerContainerNode.set('scrollLeft', this._bodyContainerNode.get('scrollLeft'));
			
			if(!this.get('height') && (YUA.ie)) {
						w = (tBodyContainer.get('scrollWidth') > tBodyContainer.get('offsetWidth')) ?
			            (tBody.get('parentNode').get('offsetHeight') + 18) + "px" : 
			            tBody.get('parentNode').get('offsetHeight') + "px";
						
						tBodyContainer.setStyle('height', w);
					}
			
		if (tBody.get('rows').length === 0) {
			this._parentMsgNode.get('parentNode').setStyle('width', this._parentTheadNode.get('parentNode').get('offsetWidth')+'px');
		}
		else {
			this._parentMsgNode.get('parentNode').setStyle('width', "");
		}
			
	},
	
	/**
	 * Adds/removes Column header overhang as necesary.
	 * Taken from YUI2 ScrollingDataTable.js
	 *
	 * @method _syncScrollOverhang
	 * @private
	 */
	_syncScrollOverhang: function() {
		var tBodyContainer = this._bodyContainerNode,
			padding = 1;
		
		if ((tBodyContainer.get('scrollHeight') > tBodyContainer.get('clientHeight')) || (tBodyContainer.get('scrollWidth') > tBodyContainer.get('clientWidth'))) {
			padding = 18;
		}
		
		this._setOverhangValue(padding);
	},
	
	
	/**
	 * Sets Column header overhang to given width.
	 * Taken from YUI2 ScrollingDataTable.js with minor modifications
	 *
	 * @method _setOverhangValue
	 * @param nBorderWidth {Number} Value of new border for overhang. 
	 * @private
	 */ 
	_setOverhangValue: function(borderWidth) {
		var host = this.get('host'),
			cols = host.get('columnset').get('columns'),
		 	lastHeaders = cols[cols.length-1] || [],
	        len = cols.length,
	        value = borderWidth + "px solid " + this.get("COLOR_COLUMNFILLER"),
			children = this._parentTheadNode.get('children').get('children')[0]._nodes; //hack here to get to the array of TH elements
	
	    //this._parentTheadNode.setStyle('display', 'none');
		YNode.one('#'+children[len-1].id).setStyle('borderRight', value);
	    // for(var i=0; i<len; i++) {
	    // 			YNode.one('#'+children[i]._yuid).setStyle('borderRight', value);
	    // 	    }
	    // 	    this._parentTheadNode.setStyle('display', '');
	}
	
	
	
	
	
	
	// setColumnWidth: function(col, width) {
	// 	colWidth = col.get('minWidth');
	// 	if (YLang.isNumber(width)) {
	// 		width = (width > colWidth) ? width : colWidth;
	// 		col.set('width', width);
	// 		
	// 		//resize dom elements
	// 		this._setColumnWidth(col, width+"px");
	// 		
	// 		this.fire('columnsetWidthEvent', {column: col, width: width});
	// 		Y.log("Set width of Column " + oColumn + " to " + nWidth + "px", "info", this.toString());
	// 	}
	// 	
	// 	else if (width === null) {
	// 		col.set('width', width);
	// 		this._setColumnWidth(col, "auto");
	// 		this.fire('columnsetWidthEvent', {column: col});
	// 		
	// 	}
	// 	else {
	// 		Y.log("Could not set width of Column " + oColumn + " to " + nWidth + "px", "warn", this.toString());
	// 	}
	// },
	// 
	// _setColumnWidth: function(col, width, overflow) {
	// 	if (col && (col.get('keyIndex') !== null)) {
	// 		overflow = overflow || (((width === '') || (width === 'auto')) ? 'visible' : 'hidden');
	// 		
	// 	}
	// }
	
	
	
	
});

Y.namespace("Plugin").DataTableScroll = DataTableScroll;





}, '@VERSION@' ,{requires:['plugin','datatable-base']});


YUI.add('datatable', function(Y){}, '@VERSION@' ,{use:['datatable-base','datatable-sort','datatable-colresize','datatable-scroll']});

