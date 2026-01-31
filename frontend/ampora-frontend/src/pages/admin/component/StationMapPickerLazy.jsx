import { lazy, Suspense, useState, useEffect } from "react";

const StationMapPicker = lazy(() => import("./StationMapPicker"));

export default function StationMapPickerLazy(props) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div
        style={{
          height: 250,
          width: "100%",
          borderRadius: 12,
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div
          style={{
            height: 250,
            width: "100%",
            borderRadius: 12,
            backgroundColor: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p className="text-gray-500">Loading map component...</p>
        </div>
      }
    >
      <StationMapPicker {...props} />
    </Suspense>
  );
}
