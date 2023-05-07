import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const baseUrl = process.env.WORDPRESS_BASE_URL as string;
  const pathArr = ctx.query.postpath as Array<string>;
  const path = pathArr.join('/');
  console.log(path);
  const fbclid = ctx.query.fbclid;

  // redirect if facebook is the referer or request contains fbclid
  const referringURL = ctx.req.headers?.referer || null;
  if (referringURL?.includes('facebook.com') || fbclid) {
    return {
      redirect: {
        permanent: false,
        destination: `${baseUrl}${encodeURI(path as string)}`,
      },
    };
  }

  const response = await fetch(`${baseUrl}/wp-json/wp/v2/posts?slug=${path}`);
  if (!response.ok) {
    return {
      notFound: true,
    };
  }
  const [post] = await response.json();
  return {
    props: {
      post,
      host: ctx.req.headers.host,
    },
  };
};

interface PostProps {
  post: any;
  host: string;
}

const Post: React.FC<PostProps> = (props) => {
  const { post, host } = props;

  // to remove tags from excerpt
  const removeTags = (str: string) => {
    if (str === null || str === '') return '';
    else str = str.toString();
    return str.replace(/(<([^>]+)>)/gi, '').replace(/\[[^\]]*\]/, '');
  };

  return (
    <>
      <Head>
        <meta property="og:title" content={post.title.rendered} />
        <link rel="canonical" href={`https://${host}/${post.slug}`} />
        <meta property="og:description" content={removeTags(post.excerpt.rendered)} />
        <meta property="og:url" content={`https://${host}/${post.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content={host.split('.')[0]} />
        <meta property="article:published_time" content={post.date_gmt} />
        <meta property="article:modified_time" content={post.modified_gmt} />
        {post.featured_media && (
          <>
            <meta property="og:image" content={post.featured_media.source_url} />
            <meta
              property="og:image:alt"
              content={post.featured_media.alt_text || post.title.rendered}
            />
          </>
        )}
        <title>{post.title.rendered}</title>
      </Head>
      <div className="post-container">
        <h1>{post.title.rendered}</h1>
        {post.featured_media && (
          <img src={post.featured_media.source_url} alt={post.featured_media.alt_text || post.title.rendered} />
        )}
        <article dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
      </div>
    </>
  );
};

export default Post;
