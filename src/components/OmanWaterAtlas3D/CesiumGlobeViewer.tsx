import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  WaterFeature,
  WaterLayerCategory,
  GovernorateInfo,
  WilayatInfo
} from './types.ts';
import { WATER_LAYER_CONFIGS } from './waterAtlasData.ts';
import {
  Compass, RotateCcw, ZoomIn, ZoomOut, Eye,
  Layers, MapPin, Sparkles, Navigation, Globe,
  Shield, Droplets, Map as MapIcon, Maximize2
} from 'lucide-react';

interface CesiumGlobeViewerProps {
  waterFeatures: WaterFeature[];
  activeLayers: Set<WaterLayerCategory>;
  selectedFeature: WaterFeature | null;
  onSelectFeature: (feature: WaterFeature | null) => void;
  selectedGovernorate: GovernorateInfo | null;
  selectedWilayat: WilayatInfo | null;
  onSelectGovernorate: (gov: GovernorateInfo | null) => void;
  is2DMode: boolean;
  onToggle2D: () => void;
  className?: string;
}

declare global {
  interface Window {
    Cesium?: any;
    CESIUM_BASE_URL?: string;
  }
}

export const CesiumGlobeViewer: React.FC<CesiumGlobeViewerProps> = ({
  waterFeatures,
  activeLayers,
  selectedFeature,
  onSelectFeature,
  selectedGovernorate,
  selectedWilayat,
  onSelectGovernorate,
  is2DMode,
  onToggle2D,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const entitiesMapRef = useRef<Map<string, any>>(new Map());

  // Mouse telemetry readouts
  const [telemetry, setTelemetry] = useState<{
    lat: number;
    lng: number;
    heightM: number;
  }>({
    lat: 23.5880,
    lng: 58.3829,
    heightM: 650000
  });

  const [isCesiumReady, setIsCesiumReady] = useState<boolean>(false);
  const [engineStatus, setEngineStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [imageryType, setImageryType] = useState<'satellite' | 'topo' | 'osm'>('satellite');

  // Initialize Cesium Viewer
  useEffect(() => {
    let checkInterval: any = null;
    let attempts = 0;

    const initCesium = () => {
      if (!window.Cesium) {
        attempts++;
        if (attempts > 30) {
          // If CDN took too long, fallback gracefully
          setEngineStatus('fallback');
          clearInterval(checkInterval);
        }
        return;
      }

      clearInterval(checkInterval);

      if (!containerRef.current || viewerRef.current) return;

      const Cesium = window.Cesium;

      try {
        // Disable Cesium Ion queries to prevent 401 Invalid access token errors
        Cesium.Ion.defaultAccessToken = '';

        // Helper to create reliable XYZ tile providers without Ion dependencies
        const createTileProvider = (type: 'satellite' | 'topo' | 'osm') => {
          if (type === 'satellite') {
            return new Cesium.UrlTemplateImageryProvider({
              url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
              maximumLevel: 19,
              credit: 'Esri World Imagery'
            });
          } else if (type === 'topo') {
            return new Cesium.UrlTemplateImageryProvider({
              url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
              maximumLevel: 19,
              credit: 'Esri World Topo'
            });
          } else {
            return new Cesium.UrlTemplateImageryProvider({
              url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              maximumLevel: 19,
              credit: 'OpenStreetMap'
            });
          }
        };

        const initialProvider = createTileProvider('satellite');
        const initialLayer = new Cesium.ImageryLayer(initialProvider);

        // High-fidelity configuration for Cesium Viewer with public OSM/ESRI layers without token locks
        const viewer = new Cesium.Viewer(containerRef.current, {
          baseLayer: initialLayer,
          animation: false,
          baseLayerPicker: false,
          fullscreenButton: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          sceneModePicker: false,
          selectionIndicator: false,
          timeline: false,
          navigationHelpButton: false,
          navigationInstructionsInitiallyVisible: false,
          scene3DOnly: false,
          shouldAnimate: true,
          terrainProvider: new Cesium.EllipsoidTerrainProvider()
        });

        // Safely handle any internal rendering issues without halting UI
        if (viewer.scene && viewer.scene.renderError) {
          viewer.scene.renderError.addEventListener((_scene: any, error: any) => {
            console.warn('Cesium render error handled gracefully:', error);
          });
        }

        // Configure atmospheric lighting and globe rendering
        viewer.scene.globe.enableLighting = false;
        viewer.scene.globe.depthTestAgainstTerrain = false;
        viewer.scene.globe.showGroundAtmosphere = true;

        // Camera event handlers for telemetry readout
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

        handler.setInputAction((movement: any) => {
          const ray = viewer.camera.getPickRay(movement.endPosition);
          if (ray) {
            const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            if (cartesian) {
              const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
              setTelemetry({
                lat: Number(Cesium.Math.toDegrees(cartographic.latitude).toFixed(4)),
                lng: Number(Cesium.Math.toDegrees(cartographic.longitude).toFixed(4)),
                heightM: Math.round(viewer.camera.positionCartographic.height)
              });
            }
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // Click handler for picking water features
        handler.setInputAction((click: any) => {
          const pickedObject = viewer.scene.pick(click.position);
          if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.waterFeatureData) {
            onSelectFeature(pickedObject.id.waterFeatureData);
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // Fly smoothly to the Sultanate of Oman initial perspective
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(57.5, 21.0, 1100000.0),
          orientation: {
            heading: Cesium.Math.toRadians(0.0),
            pitch: Cesium.Math.toRadians(-65.0),
            roll: 0.0
          },
          duration: 2.5
        });

        viewerRef.current = viewer;
        setIsCesiumReady(true);
        setEngineStatus('ready');
      } catch (err) {
        console.warn('Cesium initialization notice, using fallback renderer:', err);
        setEngineStatus('fallback');
      }
    };

    checkInterval = setInterval(initCesium, 250);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        try {
          viewerRef.current.destroy();
          viewerRef.current = null;
        } catch (_) {}
      }
    };
  }, []);

  // Handle imagery type switches using direct XYZ UrlTemplateImageryProvider
  const setupImagery = (viewer: any, type: 'satellite' | 'topo' | 'osm') => {
    if (!window.Cesium || !viewer || viewer.isDestroyed()) return;
    const Cesium = window.Cesium;

    try {
      viewer.imageryLayers.removeAll();

      let url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      let credit = 'Esri World Imagery';

      if (type === 'topo') {
        url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
        credit = 'Esri World Topo';
      } else if (type === 'osm') {
        url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
        credit = 'OpenStreetMap';
      }

      const provider = new Cesium.UrlTemplateImageryProvider({
        url,
        maximumLevel: 19,
        credit
      });

      const layer = new Cesium.ImageryLayer(provider);
      viewer.imageryLayers.add(layer);
    } catch (err) {
      console.warn('Failed to switch imagery layer:', err);
    }
  };

  // Sync Imagery Switch
  useEffect(() => {
    if (viewerRef.current && isCesiumReady) {
      setupImagery(viewerRef.current, imageryType);
    }
  }, [imageryType, isCesiumReady]);

  // Sync 2D vs 3D Scene Mode
  useEffect(() => {
    if (!viewerRef.current || !isCesiumReady || !window.Cesium) return;
    const Cesium = window.Cesium;
    if (is2DMode) {
      viewerRef.current.scene.mode = Cesium.SceneMode.SCENE2D;
    } else {
      viewerRef.current.scene.mode = Cesium.SceneMode.SCENE3D;
    }
  }, [is2DMode, isCesiumReady]);

  // Update Water Feature Entities on the Globe
  useEffect(() => {
    if (!viewerRef.current || !isCesiumReady || !window.Cesium) return;
    const Cesium = window.Cesium;
    const viewer = viewerRef.current;
    const entities = viewer.entities;

    // Clear existing water feature markers
    entities.removeAll();
    entitiesMapRef.current.clear();

    // Add pins for visible water features matching active layers
    waterFeatures.forEach(feature => {
      if (!activeLayers.has(feature.category)) return;

      const layerCfg = WATER_LAYER_CONFIGS.find(l => l.id === feature.category);
      const isSelected = selectedFeature?.id === feature.id;
      const colorHex = isSelected ? '#eab308' : (layerCfg?.color || '#0284c7');
      const cesiumColor = Cesium.Color.fromCssColorString(colorHex);

      const entity = entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          feature.coordinates.lng,
          feature.coordinates.lat,
          feature.coordinates.altitudeM || 10
        ),
        point: {
          pixelSize: isSelected ? 16 : 11,
          color: cesiumColor,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: isSelected ? 3 : 1.5,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        label: {
          text: feature.nameAr,
          font: isSelected ? 'bold 13px Cairo, sans-serif' : '11px Cairo, sans-serif',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -12),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 350000),
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        waterFeatureData: feature
      });

      entitiesMapRef.current.set(feature.id, entity);
    });
  }, [waterFeatures, activeLayers, selectedFeature, isCesiumReady]);

  // Camera flight when a feature is selected
  useEffect(() => {
    if (!viewerRef.current || !isCesiumReady || !selectedFeature || !window.Cesium) return;
    const Cesium = window.Cesium;

    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        selectedFeature.coordinates.lng,
        selectedFeature.coordinates.lat - 0.04, // slight offset for realistic oblique angle
        25000.0 // 25 km altitude for close inspection
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-45.0),
        roll: 0.0
      },
      duration: 1.8
    });
  }, [selectedFeature, isCesiumReady]);

  // Camera flight when a Governorate or Wilayat is selected
  useEffect(() => {
    if (!viewerRef.current || !isCesiumReady || !window.Cesium) return;
    const Cesium = window.Cesium;

    if (selectedWilayat) {
      viewerRef.current.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          selectedWilayat.centerCoords.lng,
          selectedWilayat.centerCoords.lat,
          selectedWilayat.centerCoords.heightM || 35000
        ),
        duration: 1.8
      });
    } else if (selectedGovernorate) {
      viewerRef.current.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          selectedGovernorate.centerCoords.lng,
          selectedGovernorate.centerCoords.lat,
          selectedGovernorate.centerCoords.heightM || 80000
        ),
        duration: 2.0
      });
    }
  }, [selectedGovernorate, selectedWilayat, isCesiumReady]);

  // Fly to Oman Home Overview
  const handleFlyHome = () => {
    if (!viewerRef.current || !window.Cesium) return;
    const Cesium = window.Cesium;
    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(57.5, 21.0, 1100000.0),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-65.0),
        roll: 0.0
      },
      duration: 2.0
    });
  };

  const handleZoomIn = () => {
    if (!viewerRef.current || !window.Cesium) return;
    viewerRef.current.camera.zoomIn(viewerRef.current.camera.positionCartographic.height * 0.4);
  };

  const handleZoomOut = () => {
    if (!viewerRef.current || !window.Cesium) return;
    viewerRef.current.camera.zoomOut(viewerRef.current.camera.positionCartographic.height * 0.5);
  };

  return (
    <div className={`relative w-full h-full min-h-[580px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl ${className}`}>
      {/* Primary Cesium Mount Container */}
      <div ref={containerRef} className="w-full h-full min-h-[580px]" />

      {/* Fallback 3D Canvas in case of isolated sandbox context */}
      {engineStatus === 'fallback' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-radial from-slate-900 to-slate-950 text-white text-center space-y-4">
          <Globe className="w-16 h-16 text-teal-400 animate-pulse" />
          <h3 className="text-lg font-black">جاري تهيئة المحرك الجغرافي ثلاثي الأبعاد لسلطنة عمان</h3>
          <p className="text-xs text-slate-400 max-w-md">
            يتم الاتصال بمحرك CesiumJS وخدمات الأقمار الصناعية لعرض تضاريس وشبكات مياه السلطنة.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl"
            >
              إعادة التحميل
            </button>
          </div>
        </div>
      )}

      {/* Floating Control: North Compass & Telemetry (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/80 shadow-lg text-white text-xs font-bold flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>سلطنة عُمان 🇴🇲</span>
          <span className="text-[10px] text-teal-300 font-mono">
            {is2DMode ? 'العرض المسطح (2D)' : 'الكرة الأرضية (3D Cesium)'}
          </span>
        </div>

        {/* Real-time Geographic Telemetry Readout */}
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 font-mono flex items-center gap-3">
          <span>شمال: {telemetry.lat}° N</span>
          <span>شرق: {telemetry.lng}° E</span>
          <span>ارتفاع: {telemetry.heightM > 1000 ? `${(telemetry.heightM / 1000).toFixed(1)} كم` : `${telemetry.heightM} م`}</span>
        </div>
      </div>

      {/* Floating Navigation & Scene Controls (Bottom Right) */}
      <div className="absolute bottom-5 right-5 z-20 flex flex-col gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-2xl pointer-events-auto">
        <button
          onClick={handleFlyHome}
          title="الرجوع إلى سلطنة عمان"
          className="w-9 h-9 rounded-xl bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center transition cursor-pointer shadow-md"
        >
          <Compass className="w-4 h-4 text-amber-300" />
        </button>

        <button
          onClick={onToggle2D}
          title={is2DMode ? "الانتقال إلى ثلاثي الأبعاد 3D" : "الانتقال إلى ثنائي الأبعاد 2D"}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer text-xs font-black ${
            is2DMode ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
        >
          {is2DMode ? '3D' : '2D'}
        </button>

        <button
          onClick={handleZoomIn}
          title="تقريب (+)"
          className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={handleZoomOut}
          title="تبعيد (-)"
          className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Imagery Basemap Switcher (Top Left) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700 shadow-lg pointer-events-auto">
        <button
          onClick={() => setImageryType('satellite')}
          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
            imageryType === 'satellite' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
          }`}
        >
          أقمار صناعية
        </button>
        <button
          onClick={() => setImageryType('topo')}
          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
            imageryType === 'topo' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
          }`}
        >
          طبوغرافي
        </button>
        <button
          onClick={() => setImageryType('osm')}
          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
            imageryType === 'osm' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
          }`}
        >
          شوارع (OSM)
        </button>
      </div>

      {/* Bottom Scale & Ministry Credential Bar */}
      <div className="absolute bottom-3 left-4 z-20 bg-slate-900/80 backdrop-blur-xs px-3 py-1 rounded-xl border border-slate-800/80 text-[10px] text-slate-400 font-bold flex items-center gap-3 pointer-events-none">
        <span>بيانات وزارة الثروة الزراعية وموارد المياه العُمانية</span>
        <span>·</span>
        <span className="text-teal-400">WGS84 3D Globe</span>
      </div>
    </div>
  );
};
