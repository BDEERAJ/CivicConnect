import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './navbar.css';
const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    // 👇 NEW: This hook automatically tracks the current URL
    const location = useLocation();
    const selected = location.pathname || 'home'; // This will be '/' by default (Home)

    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        setIsMenuOpen(false);
        navigate('/auth');
    };

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <>

            <nav className="navbar navbar-expand-lg civic-nav-wrapper sticky-top py-3">
                <div className="container">

                    {/* Logo also acts as the Home button */}
                    <Link to="/" className="navbar-brand civic-nav-brand" onClick={closeMenu}>
                        <span>🌱</span> CivicConnect
                    </Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>

                        <ul className="navbar-nav mx-auto mb-2 mb-lg-0 civic-nav-middle">
                            <li className="nav-item">
                                {/* 👇 Dynamic class applied based on current URL */}
                                <Link
                                    to="/"
                                    className={`nav-link civic-nav-link ${selected === '/' ? 'is-active' : ''}`}
                                    onClick={closeMenu}
                                >
                                    Home
                                </Link>
                            </li>
                            <li className="nav-item">
                                {/* 👇 Dynamic class applied based on current URL */}
                                <Link
                                    to="/problems"
                                    className={`nav-link civic-nav-link ${selected === '/problems' ? 'is-active' : ''}`}
                                    onClick={closeMenu}
                                >
                                    Problems
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link
                                    to="/chat"
                                    className={`nav-link civic-nav-link ${selected === '/chat' ? 'is-active' : ''}`}
                                    onClick={closeMenu}
                                >
                                    Chat
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link
                                    to="/feedback"
                                    className={`nav-link civic-nav-link ${selected === '/feedback' ? 'is-active' : ''}`}
                                    onClick={closeMenu}
                                >
                                    Feedback
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link
                                    to="/add-problem"
                                    className="nav-link civic-nav-link civic-nav-link-special"
                                    onClick={closeMenu}
                                >
                                    + Add Problem
                                </Link>
                            </li>

                        </ul>

                        <div className="d-flex align-items-center">
                            {token ? (
                                <>
                                    <span className="civic-nav-user-text">Hi, {username}</span>
                                    <button onClick={handleLogout} className="btn civic-nav-btn-logout">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link to="/auth" className="btn civic-nav-btn-login" onClick={closeMenu}>
                                    Log In
                                </Link>
                            )}
                            {token && (
                                <Link to="/profile" onClick={closeMenu}
                                    className="bi bi-person-circle ml-2"
                                    style={{ fontSize: "40px", marginLeft: "10px", marginTop: "-3px", color: "#060606" }}
                                ></Link>
                            )}
                        </div>

                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;