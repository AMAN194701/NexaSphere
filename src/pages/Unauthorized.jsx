const Unauthorized = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-red-500">
          403
        </h1>

        <p className="text-xl mt-4">
          Unauthorized Access
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;