package com.team13.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.team13.backend.dto.activity.TagCreationDTO;
import com.team13.backend.dto.activity.TagResponseDTO;
import com.team13.backend.exception.ResourceNotFoundException;
import com.team13.backend.model.Tag;
import com.team13.backend.repository.TagRepository;

@Service
public class TagService {

    @Autowired
    private TagRepository tagRepository;

    public List<TagResponseDTO> getAllTagResponses() {
        return tagRepository.findAll().stream()
            .map(tag -> new TagResponseDTO(tag.getId(), tag.getName()))
            .toList();
    }

    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    public TagResponseDTO getTagById(Long id) {
        return tagRepository.findById(id)
            .map(tag -> new TagResponseDTO(tag.getId(), tag.getName()))
            .orElseThrow(() -> new ResourceNotFoundException("Tag not found with id: " + id));
    }

    @Transactional
    public TagResponseDTO saveTag(TagCreationDTO tag) {
        Tag newTag = new Tag();
        newTag.setName(tag.getName());
        Tag savedTag = tagRepository.save(newTag);
        return new TagResponseDTO(savedTag.getId(), savedTag.getName());
    }

    @Transactional
    public TagResponseDTO updateTag(TagCreationDTO tag, Long id) {
        Tag existingTag = tagRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tag not found with id: " + id));
        existingTag.setName(tag.getName());
        // Save the updated tag and return it
        Tag updatedTag = tagRepository.save(existingTag);
        return new TagResponseDTO(updatedTag.getId(), updatedTag.getName());
    }

    @Transactional
    public void deleteTag(Long id) {
        if (!tagRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tag not found with id: " + id);
        }
        tagRepository.deleteById(id);
    }

    public TagResponseDTO tagToDto(Tag tag) {
        if (tag == null) {
            return null;
        }
        return new TagResponseDTO(tag.getId(), tag.getName());
    }
}
