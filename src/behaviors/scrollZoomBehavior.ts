///<reference path="../reference.ts" />

module Plottable {
export module Behavior {
  export class ScrollZoom<D> {
    private _scrollInteraction: Interaction.Scroll;
    private _scale: Scale.AbstractQuantitative<D>;
    private _zoomVertical: boolean;

    constructor(scale: Scale.AbstractQuantitative<D>, isVertical: boolean) {
      this._scale = scale;
      this._zoomVertical = isVertical;
      this._scrollInteraction = new Interaction.Scroll();
      this._setupInteraction(this._scrollInteraction);
    }

    public getInteraction() {
      return this._scrollInteraction;
    }

    private _setupInteraction(scrollInteraction: Interaction.Scroll) {
      var magnifyAmount = 1;
      this._scrollInteraction.onScroll((point: Point, deltaAmount: number) => {
        var pixelValue = this._zoomVertical ? point.y : point.x;
        var dataValue = this._scale.invert(pixelValue);
        var oldMagnifyAmount = magnifyAmount;
        magnifyAmount = Math.pow(2, -deltaAmount * .002) * magnifyAmount;
        this._scale.domain(ScaleDomainTransformers.magnify(this._scale, magnifyAmount / oldMagnifyAmount));
        this._scale.domain(ScaleDomainTransformers.translate(this._scale, this._scale.scale(dataValue) - pixelValue));
      });
    }

  }
}
}
