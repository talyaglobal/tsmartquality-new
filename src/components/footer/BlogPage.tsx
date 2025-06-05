import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const BlogPage: React.FC = () => {
  const posts = [
    {
      id: '1',
      title: 'The Future of Quality Management in Industry 4.0',
      excerpt: 'Exploring how digital transformation and Industry 4.0 are revolutionizing quality management practices.',
      image: 'https://images.pexels.com/photos/3913025/pexels-photo-3913025.jpeg',
      author: 'John Smith',
      date: '2024-03-15',
      category: 'Technology'
    },
    {
      id: '2',
      title: 'Best Practices for Supplier Quality Management',
      excerpt: 'Learn how to effectively manage and improve supplier quality in your organization.',
      image: 'https://images.pexels.com/photos/3913026/pexels-photo-3913026.jpeg',
      author: 'Sarah Johnson',
      date: '2024-03-14',
      category: 'Best Practices'
    },
    {
      id: '3',
      title: 'The Role of AI in Quality Control',
      excerpt: 'Discover how artificial intelligence is transforming quality control processes.',
      image: 'https://images.pexels.com/photos/3913027/pexels-photo-3913027.jpeg',
      author: 'Michael Brown',
      date: '2024-03-13',
      category: 'Innovation'
    },
    {
      id: '4',
      title: 'Implementing HACCP in Food Manufacturing',
      excerpt: 'A comprehensive guide to implementing Hazard Analysis Critical Control Points in food production.',
      image: 'https://images.pexels.com/photos/8850731/pexels-photo-8850731.jpeg',
      author: 'Emily Davis',
      date: '2024-03-12',
      category: 'Food Safety'
    },
    {
      id: '5',
      title: 'Quality Management System Documentation: Best Practices',
      excerpt: 'How to create and maintain effective quality management system documentation.',
      image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
      author: 'David Wilson',
      date: '2024-03-10',
      category: 'Documentation'
    },
    {
      id: '6',
      title: 'Measuring and Improving Quality KPIs',
      excerpt: 'Strategies for defining, measuring, and continuously improving quality key performance indicators.',
      image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg',
      author: 'Jennifer Lee',
      date: '2024-03-08',
      category: 'Performance'
    }
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Quality Management Insights</h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          Stay up to date with the latest trends, best practices, and insights in quality management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-[var(--primary-main)]">{post.category}</span>
                <div className="flex items-center text-sm text-[var(--text-secondary)]">
                  <Calendar size={16} className="mr-1" />
                  {post.date}
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-[var(--text-secondary)] mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-[var(--text-secondary)]">
                  <User size={16} className="mr-1" />
                  {post.author}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<ArrowRight size={16} />}
                >
                  Read More
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="mt-16 text-center">
        <Card>
          <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-2xl mx-auto">
            Get the latest quality management insights delivered directly to your inbox.
          </p>
          <div className="flex flex-col md:flex-row justify-center md:space-x-4 space-y-4 md:space-y-0">
            <input
              type="email"
              placeholder="Enter your email"
              className="border border-[var(--divider)] rounded-md px-4 py-2 md:w-64"
            />
            <Button>
              Subscribe
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BlogPage;