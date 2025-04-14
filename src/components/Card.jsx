export default function Card({ jobName, jobDescription, id, deleteTodo }) {
    console.log('Card')

    return (
        <div className="card w-70 border-2 p-4 m-4 rounded-lg text-center">
            <h2 className="text-black text-3xl mb-2">{jobName}</h2><hr />
            <p className="text-black mt-2">{jobDescription}</p>
            <button className="mt-4 bg-red-500 hover:bg-red-700 w-full h-10 rounded-lg text-white" onClick={() => deleteTodo(id)}>Delete</button>
        </div>
    )
}