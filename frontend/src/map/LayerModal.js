import React, { useState } from "react";
import { Modal } from "antd";
import { LAYERS, LAYER_STATUS } from "./constant";

const LayerModal = ({
  mapRef,
  isModalOpen,
  setIsModalOpen,
  currentLayers,
  setCurrentLayers,
}) => {


  const [IFRCModalOpen, setIFRCModalOpen] = useState(false);

  const [layerStatus, setLayerStatus] = useState(() => {
    return LAYERS.reduce((acc, layer) => {
      acc[layer.name] = LAYER_STATUS.NOT_RENDERING;
      return acc;
    }, {});
  });

  const addLayer = (layerName) => {
    setCurrentLayers([...currentLayers, layerName]);
    const maplibreMap = mapRef.current;
    const layer = LAYERS.find((layer) => layer.name === layerName);
    if (layer.type === "TMS") {
      maplibreMap.addSource(layerName, {
        type: "raster",
        tiles: [layer.url],
        tileSize: 256,
      });
      maplibreMap.addLayer({
        id: layerName,
        type: "raster",
        source: layerName,
        paint: {
          "raster-opacity": 1,
        },
      });
    } else if (layer.type === "geojson") {
      maplibreMap.loadImage(
        require("./../images/IFRC.jpeg"),
        function (error, image) {
          if (error) throw error;
          maplibreMap.addImage("custom-marker", image);
          // Add a GeoJSON source with 15 points
          maplibreMap.addSource(layerName, {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: layer.data,
            },
          });

          // Add a symbol layer
          maplibreMap.addLayer({
            id: layerName,
            type: "symbol",
            source: layerName,
            layout: {
              "icon-image": "custom-marker",
              "icon-size": 0.1,
            },
            interactive: true
          });
        }
      );

      maplibreMap.on('dblclick', layerName, function (e) {
        const features = maplibreMap.queryRenderedFeatures(e.point, { layers: ['IFRC Points'] });
        const clickedFeature = features[0];
        const clickedFeatureId = clickedFeature.properties.id;
        const layer = LAYERS.find((layer) => layer.name === layerName);
        const feature = layer.data.find(f => f.properties.id === clickedFeatureId);

        console.log(layer);
        feature.geometry.coordinates = [-68.84734335564356, 18.38480676410721];
        const updatedFeatures = [...layer.data];
        updatedFeatures[clickedFeatureId] = feature;
        layer.data = updatedFeatures;
        removeLayer(layerName);


        maplibreMap.loadImage(
          require("./../images/IFRC.jpeg"),
          function (error, image) {
            if (error) throw error;
            maplibreMap.addImage("custom-marker", image);
            // Add a GeoJSON source with 15 points
            maplibreMap.addSource(layerName, {
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: layer.data,
              },
            });
            //todo refactor this function. should be easy to do
            // Add a symbol layer
            maplibreMap.addLayer({
              id: layerName,
              type: "symbol",
              source: layerName,
              layout: {
                "icon-image": "custom-marker",
                "icon-size": 0.1,
              },
              interactive: true
            });
          }
        );
      })
    };

    const layers = mapRef.current.getStyle().layers;

    const drawLayers = layers.filter((layer) => layer.id.startsWith("gl-draw"));

    drawLayers.forEach((layer) => {
      mapRef.current.moveLayer(layer.id);
    });
    updateLayerStatus(layerName, LAYER_STATUS.IS_RENDERING);
  };

  const removeLayer = (layerName) => {
    setCurrentLayers(currentLayers.filter((layer) => layer !== layerName));
    const maplibreMap = mapRef.current;
    maplibreMap.removeLayer(layerName);
    maplibreMap.removeSource(layerName);
    if (maplibreMap.hasImage("custom-marker")) {
      maplibreMap.removeImage("custom-marker");
    }
    updateLayerStatus(layerName, LAYER_STATUS.NOT_RENDERING);
  };

  const changeOpacity = (event, layerName) => {
    const value = event.target.value;
    const opacity = value / 100;
    const maplibreMap = mapRef.current;
    const layer = LAYERS.find((layer) => layer.name === layerName);
    if (layer.type === "TMS") {
      maplibreMap.setPaintProperty(layerName, "raster-opacity", opacity);
    } else {
      maplibreMap.setPaintProperty(layerName, "icon-opacity", opacity);
    }
  };

  const checkLayerStatus = (layerName) => {
    return layerStatus[layerName];
  };

  const updateLayerStatus = (layerName, status) => {
    setLayerStatus({
      ...layerStatus,
      [layerName]: status,
    });
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Modal
      title="Basic Modal"
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      style={{ maxHeight: "300px" }}
    >
      {LAYERS.map((item, index) => (
        <div
          key={index}
          style={{
            border: "2px ",
            borderRadius: "5px",
            padding: "10px",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
            }}
          >
            {item.name}
          </div>
          {checkLayerStatus(item.name) === LAYER_STATUS.IS_RENDERING ? (
            <>
              <input
                type="range"
                min="0"
                max="100"
                onChange={(e) => changeOpacity(e, item.name)}
              />
              <button onClick={(e) => removeLayer(item.name)}>
                Remove this layer
              </button>
            </>
          ) : (
            <button onClick={(e) => addLayer(item.name)}>Add this layer</button>
          )}
        </div>
      ))}
    </Modal>
  );
};

export default LayerModal;
