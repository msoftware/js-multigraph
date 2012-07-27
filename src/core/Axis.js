if (!window.multigraph) {
    window.multigraph = {};
}

(function (ns) {
    "use strict";

    var Axis,
        Title,
        Labels,
        Labeler,
        Grid,
        Pan,
        Zoom,
        Binding,
        AxisControls,
        defaultValues = ns.utilityFunctions.getDefaultValuesFromXSD(),
        attributes = ns.utilityFunctions.getKeys(defaultValues.horizontalaxis);

    if (ns.Axis) {
        if (ns.Axis.Title) {
            Title = ns.Axis.Title;
        }
        if (ns.Axis.Labels) {
            Labels = ns.Axis.Labels;
        }
        if (ns.Axis.Labeler) {
            Labeler = ns.Axis.Labeler;
        }
        if (ns.Axis.Grid) {
            Grid = ns.Axis.Grid;
        }
        if (ns.Axis.Pan) {
            Pan = ns.Axis.Pan;
        }
        if (ns.Axis.Zoom) {
            Zoom = ns.Axis.Zoom;
        }
        if (ns.Axis.Binding) {
            Binding = ns.Axis.Binding;
        }
        if (ns.Axis.AxisControls) {
            AxisControls = ns.Axis.AxisControls;
        }
    }

    Axis = new window.jermaine.Model( "Axis", function () {
        this.hasA("title").which.validatesWith(function (title) {
            return title instanceof ns.Axis.Title;
        });
        this.hasA("labels").which.validatesWith(function (labels) {
            return labels instanceof ns.Axis.Labels;
        });
        this.hasMany("labelers").which.validatesWith(function (labelers) {
            return labelers instanceof ns.Axis.Labeler;
        });
        this.hasA("grid").which.validatesWith(function (grid) {
            return grid instanceof ns.Axis.Grid;
        });
        this.hasA("pan").which.validatesWith(function (pan) {
            return pan instanceof ns.Axis.Pan;
        });
        this.hasA("zoom").which.validatesWith(function (zoom) {
            return zoom instanceof ns.Axis.Zoom;
        });
        this.hasA("binding").which.validatesWith(function (binding) {
            return binding instanceof ns.Axis.Binding;
        });
        this.hasA("axiscontrols").which.validatesWith(function (axiscontrols) {
            return axiscontrols instanceof ns.Axis.AxisControls;
        });
        this.hasAn("id").which.validatesWith(function (id) {
            return typeof(id) === "string";
        });
        this.hasA("type").which.isOneOf(ns.DataValue.types());
        this.hasA("length").which.validatesWith(function (length) {
            return length instanceof ns.math.Displacement;
        });
        this.hasA("position").which.validatesWith(function (position) {
            return position instanceof ns.math.Point;
        });
        this.hasA("pregap").which.isA("number");
        this.hasA("postgap").which.isA("number");
        this.hasAn("anchor").which.isA("number");
        this.hasA("base").which.validatesWith(function (base) {
            return base instanceof ns.math.Point;
        });



        // The "min" attribute stores the "min" value from the mugl file, if there was one -- as a string!!!
        this.hasA("min").which.isA("string");

        // The "dataMin" attribute is the current min DataValue for the axis
        this.hasA("dataMin").which.validatesWith(function(x) {
            return ns.DataValue.isInstance(x);
        });
        // Convenience method for checking to see if dataMin has been set or not
        this.respondsTo("hasDataMin", function() {
            return this.dataMin() !== undefined;
        });

                                             
        this.hasA("minoffset").which.isA("number");
        this.hasA("minposition").which.validatesWith(function (minposition) {
            return minposition instanceof ns.math.Displacement;
        });




        // The "max" attribute stores the "max" value from the mugl file, if there was one -- as a string!!!
        this.hasA("max").which.isA("string");

        // The "dataMax" attribute is the current max DataValue for the axis
        this.hasA("dataMax").which.validatesWith(function(x) {
            return ns.DataValue.isInstance(x);
        });
        // Convenience method for checking to see if dataMax has been set or not
        this.respondsTo("hasDataMax", function() {
            return this.dataMax() !== undefined;
        });



        this.hasA("maxoffset").which.isA("number");
        this.hasA("maxposition").which.validatesWith(function (maxposition) {
            return maxposition instanceof ns.math.Displacement;
        });





        this.hasA("positionbase").which.validatesWith(function (positionbase) {
            //deprecated
            return typeof(positionbase) === "string";
        });
        this.hasA("color").which.validatesWith(function (color) {
            return color instanceof ns.math.RGBColor;
        });
        this.hasA("tickmin").which.isA("integer");
        this.hasA("tickmax").which.isA("integer");
        this.hasA("highlightstyle").which.validatesWith(function (highlightstyle) {
            return typeof(highlightstyle) === "string";
        });
        this.hasA("linewidth").which.isA("integer");
        this.hasA("orientation").which.validatesWith(function (orientation) {
            return (orientation === Axis.HORIZONTAL) || (orientation === Axis.VERTICAL);
        });
        this.isBuiltWith("orientation");

        this.hasA("pixelLength").which.isA("number");
        this.hasA("parallelOffset").which.isA("number");
        this.hasA("perpOffset").which.isA("number");

        this.hasA("axisToDataRatio").which.isA("number");

        this.respondsTo("initializeGeometry", function(graph) {
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
/*
            if (_orientation == AxisOrientation.HORIZONTAL) {
                _pixelLength = _length.calculateLength( _graph.plotBox.width );
                _parallelOffset = _position.x + (_base.x + 1) * _graph.plotBox.width/2 - (_anchor + 1) * _pixelLength / 2;
                _perpOffset = _position.y + (_base.y + 1) * _graph.plotBox.height/2;
            } else {
                _pixelLength = _length.calculateLength( _graph.plotBox.height );
                _parallelOffset = _position.y + (_base.y + 1) * _graph.plotBox.height/2 - (_anchor + 1) * _pixelLength / 2;
                _perpOffset = _position.x + (_base.x + 1) * _graph.plotBox.width/2;
            }
            _minOffset = _minposition.calculateCoordinate(_pixelLength);
            _maxOffset = _pixelLength - _maxposition.calculateCoordinate(_pixelLength);
            _reversed = (_minOffset > _pixelLength - _maxOffset);
            if (_haveDataMin && _haveDataMax) {
                computeAxisToDataRatio();
            }
*/
        });

        this.respondsTo("computeAxisToDataRatio", function() {
            if (this.hasDataMin() && this.hasDataMax()) {
/*
console.log('pixelLength: ' + this.pixelLength());
console.log('maxoffset: ' + this.maxoffset());
console.log('minoffset: ' + this.minoffset());
console.log('dataMax: ' + this.dataMax().getRealValue());
console.log('dataMin: ' + this.dataMin().getRealValue());
*/
                this.axisToDataRatio((this.pixelLength() - this.maxoffset() - this.minoffset()) / (this.dataMax().getRealValue() - this.dataMin().getRealValue()));
            }
        });

        this.respondsTo("dataValueToAxisValue", function(v) {
            return this.axisToDataRatio() * ( v.getRealValue() - this.dataMin().getRealValue() ) + this.minoffset() + this.parallelOffset();
        });

        ns.utilityFunctions.insertDefaults(this, defaultValues.horizontalaxis, attributes);
    });

    Axis.HORIZONTAL = "horizontal";
    Axis.VERTICAL   = "vertical";

    ns.Axis = Axis;
    if (Title) {
        ns.Axis.Title = Title;
    }
    if (Labels) {
        ns.Axis.Labels = Labels;
    }
    if (Labeler) {
        ns.Axis.Labeler = Labeler;
    }
    if (Grid) {
        ns.Axis.Grid = Grid;
    }
    if (Pan) {
        ns.Axis.Pan = Pan;
    }
    if (Zoom) {
        ns.Axis.Zoom = Zoom;
    }
    if (Binding) {
        ns.Axis.Binding = Binding;
    }
    if (AxisControls) {
        ns.Axis.AxisControls = AxisControls;
    }

}(window.multigraph));