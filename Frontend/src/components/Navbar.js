import { Link } from 'react-router-dom'

const Navbar = () => {
    const handleRefreshPage = () => {
        window.location.reload();
    };

    return (
        <header>
            <div className="container">
                <Link to="/" onClick={handleRefreshPage}>
                    <h1>Location and device services</h1>
                </Link>
            </div>
        </header>
    );
};

export default Navbar;
