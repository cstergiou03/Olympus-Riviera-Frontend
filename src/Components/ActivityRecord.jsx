import React from "react";
import { useNavigate } from "react-router-dom";
import "../Style/experienceRecord.css";

function ActivityRecord({ data, isVisited }) {
    const navigate = useNavigate();

    const googleMapsLink = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
    
    const photosTable = data.photos
    ? data.photos
          .split("data:image/jpeg;base64,")
          .filter((photo) => photo.trim() !== "")
          .map((photo) =>
              "data:image/jpeg;base64," + photo.trim().replace(/,$/, "")
          ) // Αφαιρούμε οποιοδήποτε κόμμα στο τέλος
    : [];
    
    return (
        <div className={`experience-record ${isVisited ? "visited" : ""}`}>
            <div className="record-column">
                {data.name} 
                {isVisited && <span className="checkmark">✅</span>}
            </div>
            <div className="record-column">{data.description}</div>
            <div className="record-column">
                {photosTable.length > 0 ? (
                    <img
                        src={photosTable[0]}
                        className="record-image"
                        alt="experience"
                    />
                ) : null}
            </div>
            <div className="record-column">
                <button
                    onClick={() => window.open(googleMapsLink, "_blank")}
                    className="directions-button"
                >
                    Οδηγίες
                </button>
                <button
                    onClick={() => navigate(`/activity/${data.activity_id}`)}
                    className="more-button"
                >
                    Περισσότερα
                </button>
            </div>
        </div>
    );
}

export default ActivityRecord;
