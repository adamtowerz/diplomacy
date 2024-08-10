import React, { ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useCombinedRefs } from "@common/web-components";
import { Point, PointUtils } from "@/utils/point";
import { Box, BoxUtils } from "@/utils/box";
import { debounce, noop } from "lodash-es";

export type ControlMethod = "mouse" | "trackpad";

export interface PanZoomMapProps extends React.HTMLAttributes<HTMLDivElement> {
  controlMethod?: ControlMethod;

  defaultZoom?: number;
  defaultTranslation?: Point;

  isPanEnabled?: boolean;
  isZoomEnabled?: boolean;

  panSensitivity?: number;
  zoomSensitivity?: number;

  minZoom?: number;
  maxZoom?: number;

  onPanZoom?: (translation: Point, scale: number) => void;
  sibling?: ReactNode;
}

export type PanZoomScaleContextData = {
  scale: number;
  setScale: (scale: number) => void;
};
export const PanZoomScaleContext = React.createContext<PanZoomScaleContextData>({ scale: 1, setScale: noop });

export type PanZoomTranslateContextData = {
  translation: Point;
  setTranslation: (translation: Point) => void;
  defaultTranslation: Point;
};
export const PanZoomTranslateContext = React.createContext<PanZoomTranslateContextData>({
  translation: PointUtils.ORIGIN,
  setTranslation: noop,
  defaultTranslation: PointUtils.ORIGIN,
});

export function usePanZoomScaleContext() {
  const { scale, setScale } = useContext(PanZoomScaleContext);

  return { scale, setScale };
}

export function usePanZoomTranslateContext() {
  const { translation, setTranslation, defaultTranslation } = useContext(PanZoomTranslateContext);

  return { translation, setTranslation, defaultTranslation };
}

export function usePanZoomContext() {
  const { translation, setTranslation } = usePanZoomTranslateContext();
  const { scale, setScale } = usePanZoomScaleContext();

  function untransformBox(box: Box): Box {
    // const translationOffset = PointUtils.subtract(translation, defaultTranslation);
    return BoxUtils.scale(BoxUtils.translate(box, PointUtils.scale(translation, -1)), 1 / scale);
  }

  return { scale, setScale, translation, setTranslation, untransformBox };
}

const PanZoomMap = React.forwardRef<HTMLDivElement, PanZoomMapProps>(function PanZoomMap(
  {
    controlMethod = "mouse",

    defaultZoom = 1,
    defaultTranslation = PointUtils.ORIGIN,

    isPanEnabled = true,
    isZoomEnabled = true,

    panSensitivity = 1,
    zoomSensitivity = 1,

    minZoom = 0.1,
    maxZoom = 10,

    onPanZoom,

    sibling,
    children,

    ...props
  },
  ref
) {
  const internalRef = useRef<HTMLDivElement>(null);
  const map = useCombinedRefs(ref, internalRef);
  const canvasRef = useRef<HTMLDivElement>(null);

  const translation = useRef<Point>(defaultTranslation);
  const zoom = useRef<number>(defaultZoom);

  const startGrabMousePosition = useRef<Point | null | undefined>();
  const startGrabTranslation = useRef<Point | null | undefined>();

  // Transform state is a non-render critical clone of the internal translation and scale that is passed to context
  // for children to consume. It may be slightly out of date as it is not updated every frame.
  const [transformState, setTransformStateRaw] = useState<{ translation: Point; scale: number }>({
    translation: defaultTranslation,
    scale: defaultZoom,
  });

  const setTransformState = useRef(debounce(setTransformStateRaw, 50, { maxWait: 150 }));

  const translateContext = useMemo<PanZoomTranslateContextData>(
    () => ({
      translation: transformState.translation,
      setTranslation: (newTranslation) => {
        translation.current = newTranslation;
        updateTransform();
      },
      defaultTranslation,
    }),
    [transformState]
  );
  const zoomContext = useMemo<PanZoomScaleContextData>(
    () => ({
      scale: transformState.scale,
      setScale: (newScale) => {
        zoom.current = newScale;
        updateTransform();
      },
    }),
    [transformState]
  );

  function getTransformString(): string {
    return `translate(calc(50% + ${translation.current.x}px), ${translation.current.y}px) scale(${zoom.current})`;
  }

  const updateTransform = () => {
    if (canvasRef.current) {
      canvasRef.current.style.transform = getTransformString();
      setTransformState.current({ translation: translation.current, scale: zoom.current });
      onPanZoom && onPanZoom(translation.current, zoom.current);
    }
  };

  useEffect(() => {
    if (map.current == null) {
      return;
    }

    const mapElement = map.current;

    const handleZoom = (e: WheelEvent): [Point, number] => {
      const xScale = (e.clientX - mapElement.getBoundingClientRect().x - translation.current.x) / zoom.current;
      const yScale = (e.clientY - mapElement.getBoundingClientRect().y - translation.current.y) / zoom.current;

      const adjSensitivity = controlMethod === "mouse" ? zoomSensitivity / 4 : zoomSensitivity;
      let newZoom = zoom.current - zoom.current * e.deltaY * 0.01 * adjSensitivity;

      if (minZoom != null) {
        newZoom = Math.max(minZoom, newZoom);
      }
      if (maxZoom != null) {
        newZoom = Math.min(maxZoom, newZoom);
      }

      const newTranslation = {
        x: e.clientX - mapElement.getBoundingClientRect().x - xScale * newZoom,
        y: e.clientY - mapElement.getBoundingClientRect().y - yScale * newZoom,
      };

      return [newTranslation, newZoom];
    };

    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      switch (controlMethod) {
        case "mouse":
          if (!e.ctrlKey) {
            [translation.current, zoom.current] = handleZoom(e);
            updateTransform();
          }

          break;

        case "trackpad":
          if (!e.ctrlKey && isPanEnabled) {
            const deltaX = e.deltaX > 0 ? Math.min(e.deltaX, 75) : Math.max(e.deltaX, -75);
            const deltaY = e.deltaY > 0 ? Math.min(e.deltaY, 75) : Math.max(e.deltaY, -75);

            translation.current = {
              x: translation.current.x - deltaX * panSensitivity,
              y: translation.current.y - deltaY * panSensitivity,
            };
          } else if (e.ctrlKey && isZoomEnabled) {
            [translation.current, zoom.current] = handleZoom(e);
          }

          updateTransform();

          break;
      }
    };

    const handleMousedownEvent = (e: MouseEvent) => {
      if (controlMethod === "mouse") {
        startGrabMousePosition.current = {
          x: e.clientX,
          y: e.clientY,
        };
        startGrabTranslation.current = translation.current;
      }
    };

    const handleMousemoveEvent = (e: MouseEvent) => {
      if (startGrabTranslation.current && startGrabMousePosition.current) {
        e.preventDefault();
        translation.current = {
          x: startGrabTranslation.current.x + e.clientX - startGrabMousePosition.current.x,
          y: startGrabTranslation.current.y + e.clientY - startGrabMousePosition.current.y,
        };

        updateTransform();
      }
    };

    const handleMouseupEvent = () => {
      startGrabMousePosition.current = null;
    };

    switch (controlMethod) {
      case "mouse":
        if (isPanEnabled) {
          mapElement.addEventListener("mousedown", handleMousedownEvent);
          mapElement.addEventListener("mousemove", handleMousemoveEvent);
          mapElement.addEventListener("mouseup", handleMouseupEvent);
        }
        if (isZoomEnabled) {
          mapElement.addEventListener("wheel", handleWheelEvent, { capture: true });
        }

        break;
      case "trackpad":
        if (isPanEnabled || isZoomEnabled) {
          mapElement.addEventListener("wheel", handleWheelEvent, { capture: true });
        }
        break;
    }

    return () => {
      mapElement.removeEventListener("wheel", handleWheelEvent);
      mapElement.removeEventListener("mousedown", handleMousedownEvent);
      mapElement.removeEventListener("mousemove", handleMousemoveEvent);
      mapElement.removeEventListener("mouseup", handleMouseupEvent);
    };
  }, [controlMethod, isPanEnabled, isZoomEnabled, panSensitivity, zoomSensitivity, minZoom, maxZoom, onPanZoom, map]);

  return (
    <PanZoomScaleContext.Provider value={zoomContext}>
      <PanZoomTranslateContext.Provider value={translateContext}>
        <div style={{ height: "100%", overflow: "hidden" }} ref={map} {...props}>
          <div style={{ transformOrigin: "0px 0px", transform: getTransformString() }} ref={canvasRef}>
            {children}
          </div>
        </div>
        {sibling}
      </PanZoomTranslateContext.Provider>
    </PanZoomScaleContext.Provider>
  );
});

export default PanZoomMap;
