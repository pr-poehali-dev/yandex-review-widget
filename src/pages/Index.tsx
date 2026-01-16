import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Review {
  id: number;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  images: string[];
}

const mockReviews: Review[] = [
  {
    id: 1,
    author: 'Анна Смирнова',
    avatar: '',
    rating: 5,
    date: '2024-01-15',
    text: 'Отличный сервис! Быстрая доставка, качественный продукт. Рекомендую всем своим друзьям и знакомым.',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e']
  },
  {
    id: 2,
    author: 'Дмитрий Иванов',
    avatar: '',
    rating: 4,
    date: '2024-01-10',
    text: 'Хорошее качество за свою цену. Есть небольшие замечания, но в целом доволен покупкой.',
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f']
  },
  {
    id: 3,
    author: 'Елена Петрова',
    avatar: '',
    rating: 5,
    date: '2024-01-08',
    text: 'Превосходно! Именно то, что искала. Качество на высоте, упаковка отличная.',
    images: []
  },
  {
    id: 4,
    author: 'Михаил Сидоров',
    avatar: '',
    rating: 3,
    date: '2024-01-05',
    text: 'Средненько. Ожидал большего за эту цену.',
    images: ['https://images.unsplash.com/photo-1560343090-f0409e92791a']
  },
  {
    id: 5,
    author: 'Ольга Козлова',
    avatar: '',
    rating: 5,
    date: '2023-12-28',
    text: 'Великолепный товар! Очень довольна покупкой. Буду заказывать еще.',
    images: ['https://images.unsplash.com/photo-1491553895911-0055eca6402d', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff']
  }
];

const Index = () => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');

  const averageRating = (
    mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length
  ).toFixed(1);

  const filteredReviews = mockReviews
    .filter(review => selectedRating === null || review.rating === selectedRating)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return b.rating - a.rating;
    });

  const allImages = mockReviews.flatMap(review => review.images).slice(0, 6);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Отзывы наших клиентов
          </h1>
          <p className="text-muted-foreground text-lg">
            Реальные впечатления от покупателей
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-8 text-center hover:shadow-xl transition-shadow duration-300 animate-scale-in">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <Icon name="Star" className="text-primary" size={32} />
              </div>
            </div>
            <div className="text-5xl font-bold mb-2">{averageRating}</div>
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  name="Star"
                  size={20}
                  className={i < Math.round(parseFloat(averageRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <p className="text-muted-foreground">Средняя оценка</p>
          </Card>

          <Card className="p-8 text-center hover:shadow-xl transition-shadow duration-300 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex justify-center mb-4">
              <div className="bg-accent/10 p-4 rounded-full">
                <Icon name="MessageSquare" className="text-accent" size={32} />
              </div>
            </div>
            <div className="text-5xl font-bold mb-2">{mockReviews.length}</div>
            <p className="text-muted-foreground">Всего отзывов</p>
          </Card>

          <Card className="p-8 text-center hover:shadow-xl transition-shadow duration-300 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex justify-center mb-4">
              <div className="bg-green-500/10 p-4 rounded-full">
                <Icon name="ThumbsUp" className="text-green-500" size={32} />
              </div>
            </div>
            <div className="text-5xl font-bold mb-2">
              {mockReviews.filter(r => r.rating >= 4).length}
            </div>
            <p className="text-muted-foreground">Положительных</p>
          </Card>
        </div>

        {allImages.length > 0 && (
          <div className="mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold mb-6">Фото от покупателей</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {allImages.map((image, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer shadow-md"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <img
                    src={image}
                    alt={`Фото ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8 animate-fade-in">
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="flex gap-2">
              <Button
                variant={selectedRating === null ? 'default' : 'outline'}
                onClick={() => setSelectedRating(null)}
                size="sm"
              >
                Все
              </Button>
              {[5, 4, 3, 2, 1].map(rating => (
                <Button
                  key={rating}
                  variant={selectedRating === rating ? 'default' : 'outline'}
                  onClick={() => setSelectedRating(rating)}
                  size="sm"
                  className="gap-1"
                >
                  {rating}
                  <Icon name="Star" size={14} className="fill-current" />
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant={sortBy === 'date' ? 'default' : 'outline'}
                onClick={() => setSortBy('date')}
                size="sm"
              >
                <Icon name="Calendar" size={16} className="mr-1" />
                По дате
              </Button>
              <Button
                variant={sortBy === 'rating' ? 'default' : 'outline'}
                onClick={() => setSortBy('rating')}
                size="sm"
              >
                <Icon name="TrendingUp" size={16} className="mr-1" />
                По рейтингу
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {filteredReviews.map((review, idx) => (
            <Card
              key={review.id}
              className="p-6 hover:shadow-xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={review.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {review.author.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{review.author}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(review.date).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <Badge
                      variant={review.rating >= 4 ? 'default' : 'secondary'}
                      className="gap-1 px-3 py-1"
                    >
                      <Icon name="Star" size={14} className="fill-current" />
                      {review.rating}
                    </Badge>
                  </div>

                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Icon
                        key={i}
                        name="Star"
                        size={18}
                        className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>

                  <p className="text-foreground mb-4 leading-relaxed">{review.text}</p>

                  {review.images.length > 0 && (
                    <div className="flex gap-3 flex-wrap">
                      {review.images.map((image, imgIdx) => (
                        <div
                          key={imgIdx}
                          className="w-24 h-24 rounded-lg overflow-hidden hover:scale-110 transition-transform duration-300 cursor-pointer shadow-md"
                        >
                          <img
                            src={image}
                            alt={`Фото к отзыву ${imgIdx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <Card className="p-12 text-center">
            <Icon name="Search" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Отзывы не найдены</h3>
            <p className="text-muted-foreground">
              Попробуйте изменить фильтры
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
