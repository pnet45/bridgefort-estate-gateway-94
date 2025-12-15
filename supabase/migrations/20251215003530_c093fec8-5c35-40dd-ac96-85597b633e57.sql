-- Update image URLs to use public folder paths
UPDATE training_events 
SET image = '/images/training-ai-dec-9.jpeg'
WHERE title = 'Social Media Marketing with AI - Weekly Session' AND date = '2025-12-09';

UPDATE training_events 
SET image = '/images/inspection-dec-13.jpeg'
WHERE title = 'Greenfield County & Hampton Court Estate Inspection' AND date = '2025-12-13';

-- Also update the existing Dec 2 event image if needed
UPDATE training_events 
SET image = '/images/training-ai-dec-2.jpeg'
WHERE title = 'Social Media Marketing with AI' AND date = '2025-12-02';