import React from 'react';
import Head from 'next/head';

interface PostProps {
  post: any;
  host: string;
  path: string;
}

const Post: React.FC<PostProps> = (props) => {
  const { post, host, path } = props;

  const removeTags = (str: string) => {
    if (str === null || str === '') return '';
    else str = str.toString();
    return str.replace(/(<([^>]+)>)/gi, '').replace(/\[[^\]]*\]/, '');
  };

  return (
    <>
      <Head>
        <meta property="og:title" content={post.title.rendered} />
        <link rel="canonical" href={`https://${host}/${path}`} />
        <meta property="og:description" content={removeTags(post.excerpt.rendered)} />
        <meta property="og:url" content={`https://${host}/${path}`} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content={host.split('.')[0]} />
        <meta property="article:published_time" content={post.date_gmt} />
        <meta property="article:modified_time" content={post.modified_gmt} />
        <meta property="og:image" content={post._embedded['wp:featuredmedia'][0].source_url} />
        <meta
          property="og:image:alt"
          content={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
        />
        <title>{post.title.rendered}</title>
      </Head>
      <div className="post-container">
        <h1>{post.title.rendered}</h1>
        <img
          src={post._embedded['wp:featuredmedia'][0].source_url}
          alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
        />
        <article dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
      </div>
    </>
  );
};

export const getStaticPaths = async () => {
  const response = await fetch('https://dailytrendings.info/wp-json/wp/v2/posts?_fields=slug');
  const posts = await response.json();
  const paths = posts.map((post: any) => ({
    params: { postpath: [post.slug] },
  }));
  return { paths, fallback: false };
};

export const getStaticProps = async ({ params }: { params: { postpath: string[] } }) => {
  const path = params.postpath.join('/');
  const response = await fetch(`https://dailytrendings.info/wp-json/wp/v2/posts?slug=${path}&_embed`);
  const data = await response.json();
  const post = data[0];

  return {
    props: {
      path,
      post,
      host: 'dailytrendings.info',
    },
  };
};

export default Post;
