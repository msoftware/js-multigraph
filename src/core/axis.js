window.multigraph.util.namespace("window.multigraph.core", function (ns) {
    "use strict";

    /**
     * @module multigraph
     * @submodule core
     */

    var Axis,
        defaultValues = window.multigraph.utilityFunctions.getDefaultValuesFromXSD(),
        attributes = window.multigraph.utilityFunctions.getKeys(defaultValues.horizontalaxis),
        Orientation = new window.multigraph.math.Enum("AxisOrientation");

    /**
     * Axis is a Jermaine model that controls Multigraph axes.
     *
     * @class Axis
     * @for Axis
     * @constructor
     * @param {AxisOrientation} Orientation
     */
    Axis = new window.jermaine.Model( "Axis", function () {
        this.hasA("title").which.validatesWith(function (title) {
            return title instanceof ns.AxisTitle;
        });
        this.hasMany("labelers").eachOfWhich.validateWith(function (labelers) {
            return labelers instanceof ns.Labeler;
        });
        this.hasA("grid").which.validatesWith(function (grid) {
            return grid instanceof ns.Grid;
        });
        this.hasA("pan").which.validatesWith(function (pan) {
            return pan instanceof ns.Pan;
        });
        this.hasA("zoom").which.validatesWith(function (zoom) {
            return zoom instanceof ns.Zoom;
        });
        this.hasA("binding").which.validatesWith(function (binding) {
            return binding === null || binding instanceof ns.AxisBinding;
        });
        this.hasAn("id").which.isA("string");
        this.hasA("type").which.isOneOf(ns.DataValue.types());
        this.hasA("length").which.validatesWith(function (length) {
            return length instanceof window.multigraph.math.Displacement;
        });
        this.hasA("position").which.validatesWith(function (position) {
            return position instanceof window.multigraph.math.Point;
        });
        this.hasA("pregap").which.isA("number");
        this.hasA("postgap").which.isA("number");
        this.hasAn("anchor").which.isA("number");
        this.hasA("base").which.validatesWith(function (base) {
            return base instanceof window.multigraph.math.Point;
        });

        /**
         * Stores the "min" value from the mugl file as a string, if there was one.
         *
         * @property min
         * @type {String}
         * @author jrfrimme
         */
        this.hasA("min").which.isA("string");

        /**
         * The current min DataValue for the axis.
         *
         * @property dataMin
         * @type {DataValue}
         * @author jrfrimme
         */
        this.hasA("dataMin").which.validatesWith(function (x) {
            return ns.DataValue.isInstance(x);
        });
        /**
         * Convenience method for checking to see if dataMin has been set or not
         *
         * @method hasDataMin
         * @author jrfrimme
         * @return {Boolean}
         */
        this.respondsTo("hasDataMin", function () {
            return this.dataMin() !== undefined;
        });

                                             
        this.hasA("minoffset").which.isA("number");
        this.hasA("minposition").which.validatesWith(function (minposition) {
            return minposition instanceof window.multigraph.math.Displacement;
        });

        /**
         * Stores the "max" value from the mugl file as a string, if there was one.
         *
         * @property max
         * @type {String}
         * @author jrfrimme
         */
        this.hasA("max").which.isA("string");

        /**
         * The current max DataValue for the axis.
         *
         * @property dataMax
         * @type {DataValue}
         * @author jrfrimme
         */
        this.hasA("dataMax").which.validatesWith(function (x) {
            return ns.DataValue.isInstance(x);
        });
        /**
         * Convenience method for checking to see if dataMax has been set or not.
         *
         * @method hasDataMax
         * @author jrfrimme
         * @return {Boolean}
         */
        this.respondsTo("hasDataMax", function () {
            return this.dataMax() !== undefined;
        });



        this.hasA("maxoffset").which.isA("number");
        this.hasA("maxposition").which.validatesWith(function (maxposition) {
            return maxposition instanceof window.multigraph.math.Displacement;
        });


        this.hasA("positionbase").which.isA("string"); // deprecated
        this.hasA("color").which.validatesWith(function (color) {
            return color instanceof window.multigraph.math.RGBColor;
        });
        this.hasA("tickcolor").which.validatesWith(function (color) {
            return color === null || color instanceof window.multigraph.math.RGBColor;
        });
        this.hasA("tickmin").which.isA("integer");
        this.hasA("tickmax").which.isA("integer");
        this.hasA("highlightstyle").which.validatesWith(function (highlightstyle) {
            return typeof(highlightstyle) === "string";
        });
        this.hasA("linewidth").which.isA("integer");
        this.hasA("orientation").which.validatesWith(Orientation.isInstance);
        this.isBuiltWith("orientation", function () {
            if (this.grid() === undefined) {
                this.grid(new ns.Grid());
            }
            this.zoom(new ns.Zoom());
            this.pan(new ns.Pan());
        });

        this.hasA("pixelLength").which.isA("number");
        this.hasA("parallelOffset").which.isA("number");
        this.hasA("perpOffset").which.isA("number");

        this.hasA("axisToDataRatio").which.isA("number");

        this.respondsTo("initializeGeometry", function (graph, graphicsContext) {
            var i;
            if (this.orientation() === Axis.HORIZONTAL) {
                this.pixelLength(this.length().calculateLength( graph.plotBox().width() ));
                this.parallelOffset( this.position().x() + (this.base().x() + 1) * graph.plotBox().width()/2 - (this.anchor() + 1) * this.pixelLength() / 2 );
                this.perpOffset( this.position().y() + (this.base().y() + 1) * graph.plotBox().height() / 2 );
            } else {
                this.pixelLength( this.length().calculateLength( graph.plotBox().height() ) );
                this.parallelOffset( this.position().y() + (this.base().y() + 1) * graph.plotBox().height()/2 - (this.anchor() + 1) * this.pixelLength() / 2 );
                this.perpOffset( this.position().x() + (this.base().x() + 1) * graph.plotBox().width() / 2 );
            }
            this.minoffset(this.minposition().calculateCoordinate(this.pixelLength()));
            this.maxoffset(this.pixelLength() - this.maxposition().calculateCoordinate(this.pixelLength()));
            if (this.hasDataMin() && this.hasDataMax()) {
                this.computeAxisToDataRatio();
            }
            for (i=0; i<this.labelers().size(); ++i) {
                this.labelers().at(i).initializeGeometry(graph);
            }
            if (this.title()) {
                this.title().initializeGeometry(graph, graphicsContext);
            }
        });

        this.respondsTo("computeAxisToDataRatio", function () {
            if (this.hasDataMin() && this.hasDataMax()) {
                this.axisToDataRatio((this.pixelLength() - this.maxoffset() - this.minoffset()) / (this.dataMax().getRealValue() - this.dataMin().getRealValue()));
            }
        });

        this.respondsTo("dataValueToAxisValue", function (v) {
            return this.axisToDataRatio() * ( v.getRealValue() - this.dataMin().getRealValue() ) + this.minoffset() + this.parallelOffset();
        });

        this.respondsTo("axisValueToDataValue", function (a) {
            return ns.DataValue.create( this.type(),
                                        ( this.dataMin().getRealValue() +
                                          ( a - this.minoffset() - this.parallelOffset() ) / this.axisToDataRatio()) );
        });

        this.hasA("currentLabeler").which.validatesWith(function (labeler) {
            return labeler===null || labeler instanceof ns.Labeler;
        });
        this.hasA("currentLabelDensity").which.isA("number");

        /**
         * Decides which labeler to use: take the one with the largest density <= 0.8.
         * Unless all have density > 0.8, in which case we take the first one.  This assumes
         * that the labelers list is ordered in increasing order of label density.
         * This function sets the `currentLabeler` and `currentLabelDensity` attributes.
         *
         * @method prepareRender
         * @param {Object} graphicsContext
         * @author jrfrimme
         */
        this.respondsTo("prepareRender", function (graphicsContext) {
            var currentLabeler,
                currentLabelDensity = 0,
                density = 0,
                densityThreshold = 0.8,
                i,
                labelers = this.labelers(),
                nlabelers = this.labelers().size();
            if (!this.hasDataMin() || !this.hasDataMax()) {
                // if either endpoint dataMin() or dataMax() hasn't been specified yet,
                // return immediately without doing anything
                return;
            }
            if (nlabelers<=0) {
                currentLabeler = null;
            } else {
                currentLabeler = labelers.at(0);
                currentLabelDensity = currentLabeler.getLabelDensity(graphicsContext);
                i = 1;
                while (i<nlabelers) {
                    density = labelers.at(i).getLabelDensity(graphicsContext);
                    if (density > densityThreshold) {
                        break;
                    } else {
                        currentLabeler = labelers.at(i);
                        currentLabelDensity = density;
                        ++i;
                    }
                }
            }
            this.currentLabeler(currentLabeler);
            this.currentLabelDensity(currentLabelDensity);
        });

        this.respondsTo("toRealValue", function (value) {
            if (typeof(value) === "number") {
                return value;
            } else if (ns.DataValue.isInstance(value)) {
                return value.getRealValue();
            } else {
                throw new Error("unknown value type for axis value " + value);
            }
        });

        this.respondsTo("toDataValue", function (value) {
            if (typeof(value) === "number") {
                return ns.DataValue.create(this.type(), value);
            } else if (ns.DataValue.isInstance(value)) {
                return value;
            } else {
                throw new Error("unknown value type for axis value " + value);
            }
        });

        this.respondsTo("setDataRangeNoBind", function(min, max, dispatch) {

            // NOTE: min and max may either be plain numbers, or
            // DataValue instances.  If they're plain numbers, they
            // get converted to DataValue instances here before being
            // passed to the dataMin()/dataMax() setters below.

            var dataValueMin = this.toDataValue(min),
                dataValueMax = this.toDataValue(max);

            this.dataMin(dataValueMin);
            this.dataMax(dataValueMax);
            // if (_graph != null) { _graph.invalidateDisplayList(); }
            if (dispatch === undefined) {
                dispatch = true;
            }
            if (dispatch) {
                //dispatchEvent(new AxisEvent(AxisEvent.CHANGE,min,max));  
            }
        });

        this.respondsTo("setDataRange", function (min, max, dispatch) {
            if (this.binding()) {
                this.binding().setDataRange(this, min, max, dispatch);
            } else {
                this.setDataRangeNoBind(min, max, dispatch);
            }
        });

        this.respondsTo("doPan", function (pixelBase, pixelDisplacement) {
            var offset,
                newRealMin,
                newRealMax;

            if (!this.pan().allowed()) { return; }
            offset = pixelDisplacement / this.axisToDataRatio();
            newRealMin = this.dataMin().getRealValue() - offset;
            newRealMax = this.dataMax().getRealValue() - offset;
            if (pixelDisplacement < 0 && this.pan().min() && newRealMin < this.pan().min().getRealValue()) {
                newRealMax += (this.pan().min().getRealValue() - newRealMin);
                newRealMin = this.pan().min().getRealValue();
            }
            if (pixelDisplacement > 0 && this.pan().max() && newRealMax > this.pan().max().getRealValue()) {
                newRealMin -= (newRealMax - this.pan().max().getRealValue());
                newRealMax = this.pan().max();
            }
            this.setDataRange(ns.DataValue.create(this.type(), newRealMin),
                          ns.DataValue.create(this.type(), newRealMax));
        });

        this.respondsTo("doZoom", function (pixelBase, pixelDisplacement) {
            var baseRealValue,
                factor,
                newMin,
                newMax,
                d;
            if (!this.zoom().allowed()) {
                return;
            }
            baseRealValue = this.axisValueToDataValue(pixelBase).getRealValue();
            if (this.zoom().anchor() !== undefined) {
                baseRealValue = this.zoom().anchor().getRealValue();
            }
            factor = 10 * Math.abs(pixelDisplacement / (this.pixelLength() - this.maxoffset() - this.minoffset()));
            /*TODO: uncomment after this.reversed() has been implemented
            if (this.reversed()) { factor = -factor; }
            */
            if (pixelDisplacement <= 0) {
                newMin = ns.DataValue.create(this.type(),
                                             (this.dataMin().getRealValue() - baseRealValue) * ( 1 + factor ) + baseRealValue);
                newMax = ns.DataValue.create(this.type(),
                                             (this.dataMax().getRealValue() - baseRealValue) * ( 1 + factor ) + baseRealValue);
            } else {
                newMin = ns.DataValue.create(this.type(),
                                             (this.dataMin().getRealValue() - baseRealValue) * ( 1 - factor ) + baseRealValue);
                newMax = ns.DataValue.create(this.type(),
                                             (this.dataMax().getRealValue() - baseRealValue) * ( 1 - factor ) + baseRealValue);
            }
            if (this.pan().min() && newMin.lt(this.pan().min())) {
                newMin = this.pan().min();
            }
            if (this.pan().max() && newMax.gt(this.pan().max())) {
                newMax = this.pan().max();
            }
        
            if ((this.dataMin().le(this.dataMax()) && newMin.lt(newMax)) ||
                (this.dataMin().ge(this.dataMax()) && newMin.gt(newMax))) {
                if (this.zoom().max() && (newMax.gt(newMin.add(this.zoom().max())))) {
                    d = (newMax.getRealValue() - newMin.getRealValue() - this.zoom().max().getRealValue()) / 2;
                    newMax = newMax.addRealValue(-d);
                    newMin = newMin.addRealValue(d);
                } else if (this.zoom().min() && (newMax.lt(newMin.add(this.zoom().min())))) {
                    d = (this.zoom().min().getRealValue() - (newMax.getRealValue() - newMin.getRealValue())) / 2;
                    newMax = newMax.addRealValue(d);
                    newMin = newMin.addRealValue(-d);
                }
                this.setDataRange(newMin, newMax);
            }
        });

        /**
         * Compute the distance from an axis to a point.  The point
         * (x,y) is expressed in pixel coordinates in the same
         * coordinate system as the axis.
         * 
         * We use two different kinds of computations depending on
         * whether the point lies inside or outside the region bounded
         * by the two lines perpendicular to the axis through its
         * endpoints.  If the point lies inside this region, the
         * distance is simply the difference in the perpendicular
         * coordinate of the point and the perpendicular coordinate of
         * the axis.
         * 
         * If the point lies outside the region, then the distance is
         * the L2 distance between the point and the closest endpoint
         * of the axis.
         *
         * @method distanceToPoint
         * @param {} x
         * @param {} y
         * @author jrfrimme
         */
        this.respondsTo("distanceToPoint", function (x, y) {
            var perpCoord     = (this.orientation() === Axis.HORIZONTAL) ? y : x;
            var parallelCoord = (this.orientation() === Axis.HORIZONTAL) ? x : y;
            if (parallelCoord < this.parallelOffset()) {
                // point is under or left of the axis; return L2 distance to bottom or left axis endpoint
                return window.multigraph.math.util.l2dist(parallelCoord, perpCoord, this.parallelOffset(), this.perpOffset());
            }
            if (parallelCoord > this.parallelOffset() + this.pixelLength()) {
                // point is above or right of the axis; return L2 distance to top or right axis endpoint
                return window.multigraph.math.util.l2dist(parallelCoord, perpCoord, this.parallelOffset()+this.pixelLength(), this.perpOffset());
            }
            // point is between the axis endpoints; return difference in perpendicular coords
            return Math.abs(perpCoord - this.perpOffset());
        });

        window.multigraph.utilityFunctions.insertDefaults(this, defaultValues.horizontalaxis, attributes);
    });
    Axis.HORIZONTAL = new Orientation("horizontal");
    Axis.VERTICAL   = new Orientation("vertical");

    Axis.Orientation = Orientation;

    ns.Axis = Axis;

});
