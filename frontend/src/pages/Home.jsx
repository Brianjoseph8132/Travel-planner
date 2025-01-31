import Pinterest from '../assets/Pinterest.jpeg';

const Home = () => {
    return (
        <div className="w-full h-screen overflow-hidden">
            <img 
                src={Pinterest} 
                alt="Pinterest" 
                className="w-full h-full object-cover" 
            />
        </div>
    );
}

export default Home;
