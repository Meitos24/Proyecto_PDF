import Link from "next/link"

// Supongo que tienes un componente Post, pero aquí lo haremos con Link directamente
export default async function attach_pdf () {
    const posts = await getPosts()
   
    return (
      <ul>
        {posts.map((post) => (
          // Cada elemento es un enlace a una página específica usando el id del post
          <li key={post.id}>
            <Link href={`/posts/${post.id}`}>
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    )
}