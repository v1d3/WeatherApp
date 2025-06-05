package com.team13.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.team13.backend.exception.ResourceNotFoundException;
import com.team13.backend.model.Tag;
import com.team13.backend.repository.TagRepository;

@Service
public class TagService {

    @Autowired
    private TagRepository tagRepository;

    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    public Tag getTagById(Long id) {
        return tagRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tag not found with id: " + id));
    }

    @Transactional
    public Tag saveTag(Tag tag) {
        return tagRepository.save(tag);
    }

    @Transactional
    public Tag updateTag(Tag tag) {
        if (!tagRepository.existsById(tag.getId())) {
            throw new ResourceNotFoundException("Tag not found with id: " + tag.getId());
        }
        return tagRepository.save(tag);
    }

    @Transactional
    public void deleteTag(Long id) {
        if (!tagRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tag not found with id: " + id);
        }
        tagRepository.deleteById(id);
    }
}
