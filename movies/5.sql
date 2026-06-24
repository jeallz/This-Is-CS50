SELECT title, year FROM movies
WHERE title LIKE 'Harry Potter%'
AND year <= 2011
ORDER BY year;
