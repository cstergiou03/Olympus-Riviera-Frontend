import { useState, useRef, useEffect } from "react";
import Header from "./Header";
import "../Style/topPage.css";
import seasonsData from "../assets/season.json";
import winter from "../assets/winter.png";
import spring from "../assets/spring.jpg";
import summer from "../assets/summer.jpg";
import fall from "../assets/fall.jpg";

function TopPage() {
    const [currentImage, setCurrentImage] = useState(winter); // Default image
    const [currentText, setCurrentText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 970); // Ελέγχουμε αν είναι κινητό

    const typingTimeoutRef = useRef(null);

    const imagesMap = {
        Χειμώνας: winter,
        Άνοιξη: spring,
        Καλοκαίρι: summer,
        Φθινόπωρο: fall,
    };

    const getCurrentSeason = () => {
        const currentMonth = new Date().getMonth();
        const seasonsMap = [
            { name: "Χειμώνας", months: [11, 0, 1] },
            { name: "Άνοιξη", months: [2, 3, 4] },
            { name: "Καλοκαίρι", months: [5, 6, 7] },
            { name: "Φθινόπωρο", months: [8, 9, 10] },
        ];
        const season = seasonsMap.find((season) => season.months.includes(currentMonth));
        return season ? season.name : "Άνοιξη";
    };

    useEffect(() => {
        const currentSeasonName = getCurrentSeason();
        const season = seasonsData.seasons.find((s) => s.name === currentSeasonName);

        if (season) {
            setCurrentImage(imagesMap[currentSeasonName]);
            startTyping(season.text);
        }

        // Event listener για έλεγχο του μεγέθους της οθόνης
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 970);
        };

        window.addEventListener("resize", checkMobile);
        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    }, []);

    const handleSeasonClick = (seasonName) => {
        const season = seasonsData.seasons.find((s) => s.name === seasonName);
        if (season) {
            setCurrentImage(imagesMap[seasonName]);
            startTyping(season.text);
        }
    };

    const startTyping = (text) => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        setIsTyping(true);
        setCurrentText("");
        let i = 0;

        const typeWriter = () => {
            if (i < text.length) {
                setCurrentText((prev) => prev + text.charAt(i));
                i++;
                typingTimeoutRef.current = setTimeout(typeWriter, 40);
            } else {
                setIsTyping(false);
            }
        };

        typeWriter();
    };

    return (
        <div className="main-container">
            <Header />
            <img src={currentImage} className="photo" alt="season" />
            <div className="description-container">
                <h2 className="description-title">Info</h2>
                <p className={isTyping ? "typing" : ""}>{currentText}</p>
            </div>
            
            {/* Εμφάνιση ή απόκρυψη του season-container ανάλογα με το μέγεθος της οθόνης */}
            {!isMobile && (
                <div className="season-container">
                    {seasonsData.seasons.map((season) => (
                        <p
                            key={season.name}
                            className="season-text"
                            onClick={() => handleSeasonClick(season.name)}
                        >
                            {season.name}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TopPage;
