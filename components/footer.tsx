export default function Footer() {
  return (
    <footer className='py-4'>
      <div className='container'>
        <p className='text-center text-sm text-white'>
          &copy; {new Date().getFullYear()} Project Kanban 
        </p>
      </div>
    </footer>
  )
}
