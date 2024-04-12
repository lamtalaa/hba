import './SearchBar.css';

function SearchBar({ icon=null, placeholder='', value='', onSubmitMethod=null, onChangeMethod=null }) {

    return (
        <div className="searchbar-container">
            <form className="searchbar-content-wrapper" onSubmit={onSubmitMethod}>
                {icon !== null && <div className="icon"><img src={require(`../../images/${icon}.png`)} alt={icon}/></div>}
                <div className="searchbar-input-wrapper">
                    <input type="search" className="searchbar-input" placeholder={placeholder} value={value} onChange={onChangeMethod}/>
                    <button type="submit" className="arrow-icon"><span className="arrow"></span></button>
                </div>
            </form>
        </div>
    )
}

export default SearchBar;