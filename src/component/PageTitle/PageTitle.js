import './PageTitle.css';
import { homeText } from '../Text/Text';

function PageTitle({ service }) {
    return (
        <div className="page_title-container">
            {service === "Overview" ? (
                <>
                    <h1 className="page_header">Welcome to HBA Manager</h1>
                    <p className="text">
                        {homeText[0].text}
                    </p>
                    <hr></hr>
                </>
            ) : (
                <>
                <h3 className="page_title">{service}</h3>
                <hr></hr>
                </>
            )}
        </div>
    )
}

export default PageTitle;
