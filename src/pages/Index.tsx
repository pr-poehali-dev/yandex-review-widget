import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

const YANDEX_URL = 'https://yandex.ru/maps/org/legenda/88154393306/';
const API_URL = 'https://functions.poehali.dev/2f1be17c-7fae-4c8f-b196-0ab0f7e57060';

const Index = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?url=${encodeURIComponent(YANDEX_URL)}`);
      const data = await response.json();
      
      if (data.reviews && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0 ? (
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  ).toFixed(1) : '0.0';

  const displayedReviews = reviews.slice(currentIndex, currentIndex + 3);

  const nextSlide = () => {
    if (currentIndex + 3 < reviews.length) {
      setCurrentIndex(currentIndex + 3);
    }
  };

  const prevSlide = () => {
    if (currentIndex - 3 >= 0) {
      setCurrentIndex(currentIndex - 3);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Загружаем отзывы...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            Отзывы пациентов<br />Стоматологической клиники "ЛЕГЕНДА"
          </h1>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  name="Star"
                  size={20}
                  className={i < Math.round(parseFloat(averageRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-2xl font-bold">{averageRating}</span>
            <span className="text-muted-foreground">({reviews.length} отзывов)</span>
          </div>
        </div>

        <div className="relative">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {displayedReviews.map((review, idx) => (
              <Card
                key={review.id}
                className="p-5 hover:shadow-xl transition-all duration-300 animate-fade-in flex flex-col"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={review.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {review.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{review.author}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      name="Star"
                      size={16}
                      className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>

                <p className="text-sm text-foreground leading-relaxed mb-3 line-clamp-4 flex-grow">
                  {review.text}
                </p>

                {review.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-auto">
                    {review.images.slice(0, 3).map((image, imgIdx) => (
                      <div
                        key={imgIdx}
                        className="w-16 h-16 rounded-md overflow-hidden hover:scale-110 transition-transform duration-300 cursor-pointer"
                      >
                        <img
                          src={image}
                          alt={`Фото ${imgIdx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="rounded-full"
            >
              <Icon name="ChevronLeft" size={20} />
            </Button>
            
            <div className="flex gap-2">
              {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx * 3)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    Math.floor(currentIndex / 3) === idx 
                      ? 'bg-primary w-6' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              disabled={currentIndex + 3 >= reviews.length}
              className="rounded-full"
            >
              <Icon name="ChevronRight" size={20} />
            </Button>
          </div>
        </div>

        {reviews.length === 0 && (
          <Card className="p-12 text-center">
            <Icon name="MessageSquare" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Отзывы не найдены</h3>
            <p className="text-muted-foreground">
              Пока нет отзывов для этой организации
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;